import { type NextRequest, NextResponse } from "next/server"

const UNIPAY_PUBLIC_KEY = "pk_b43b6992da8621f3940d675ed1a5f954091fb37e"
const UNIPAY_SECRET_KEY = "sk_a0aab6155b590896932e3c92f49df02c59108c74"

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

    console.log("[UNIPAY] Creating PIX payment:", { cpf, name, phone, amount })

    // Limpar CPF (remover formatação)
    const cpfLimpo = cpf.replace(/\D/g, '')
    
    // Limpar telefone (remover formatação)
    const phoneLimpo = phone.replace(/\D/g, '')
    
    // Usar o valor fornecido ou o padrão
    const finalAmount = amount || 263.23
    const amountInCents = Math.round(finalAmount * 100)

    const url = 'https://api.unipaybr.com/api'
    
    // UNIPAY usa Basic Auth com SECRET_KEY:x
    const auth = 'Basic ' + Buffer.from(UNIPAY_SECRET_KEY + ':x').toString('base64')
    
    console.log("[UNIPAY] Auth header:", auth.substring(0, 30) + "...")

    const payload = {
      amount: amountInCents,
      currency: "BRL",
      paymentMethod: "PIX",
      customer: {
        name: name,
        email: `${cpfLimpo}@temp.com`,
        document: {
          number: cpf,
          type: "CPF"
        },
        phone: phone,
        address: {
          street: "Rua Exemplo",
          streetNumber: "123",
          complement: "Apto 1",
          zipCode: "12345678",
          neighborhood: "Centro",
          city: "São Paulo",
          state: "SP",
          country: "BR"
        }
      },
      shipping: {
        fee: 0,
        address: {
          street: "Rua Exemplo",
          streetNumber: "123",
          complement: "Apto 1",
          zipCode: "12345678",
          neighborhood: "Centro",
          city: "São Paulo",
          state: "SP",
          country: "BR"
        }
      },
      items: [{
        title: "Produto005",
        unitPrice: amountInCents,
        quantity: 1,
        tangible: true,
        externalRef: `PRODUTO005_${cpfLimpo}`
      }],
      pix: {
        expiresInDays: 1
      },
      metadata: JSON.stringify({
        cpf: cpf,
        phone: phone,
        source: 'Organico-x1',
        timestamp: new Date().toISOString()
      }),
      traceable: true
    }

    console.log("[UNIPAY] Payload:", payload)

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
    console.log("[UNIPAY] Response status:", response.status)
    console.log("[UNIPAY] Response body:", responseText)

    if (!response.ok) {
      console.log("[UNIPAY] Error - Status:", response.status, "Response:", responseText)
      
      let errorMessage = `UNIPAY error: ${response.status}`
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (e) {
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
      console.log("[UNIPAY] PIX transaction created successfully:", transactionData)
    } catch (parseError) {
      console.log("[UNIPAY] Failed to parse response as JSON:", parseError)
      return NextResponse.json({
        success: false,
        error: "Resposta inválida da UNIPAY",
        provider: 'unipay'
      }, { status: 500 })
    }

    // Extrair dados PIX da resposta UNIPAY
    const pixData = transactionData.pix
    const pixCode = pixData?.qrcode || transactionData.qrcode
    const transactionId = transactionData.id
    const expirationDate = pixData?.expirationDate

    console.log("[UNIPAY] PIX data extracted:", { pixData, pixCode, transactionId, expirationDate })

    if (!pixCode) {
      console.log("[UNIPAY] No PIX QR code found in response:", transactionData)
      return NextResponse.json({
        success: false,
        error: "Código PIX não foi gerado pela UNIPAY",
        provider: 'unipay'
      }, { status: 500 })
    }

    // Calcular tempo de expiração (24 horas se não especificado)
    const expiresAt = expirationDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // Gerar QR Code usando API online
    let qrCodeImage = null
    try {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(pixCode)}`
      qrCodeImage = qrApiUrl
      console.log("[UNIPAY] QR Code URL generated successfully:", qrApiUrl)
    } catch (qrError) {
      console.log("[UNIPAY] Error generating QR Code URL:", qrError)
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
        name: transactionData.customer?.name || name,
        email: transactionData.customer?.email || `${cpfLimpo}@temp.com`,
        phone: transactionData.customer?.phone || phone
      },
      metadata: {
        cpf: cpf,
        phone: phone,
        source: 'Organico-x1',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error("[UNIPAY] Error creating PIX transaction:", error)
    
    if (error instanceof Error) {
      console.error("[UNIPAY] Error details:", {
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
