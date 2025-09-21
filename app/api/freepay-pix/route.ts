import { type NextRequest, NextResponse } from "next/server"

const FREEPAY_SECRET_KEY = "sk_live_C4C97UanuShcerwwfBIWYnTdqthmTrh2s5hYXBntPdb8q3bL"
const FREEPAY_COMPANY_ID = "b16176ba-9c1c-49d1-ad5d-aa56ef88a05d"

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

    console.log("[FREEPAY] Creating payment")

    // Limpar CPF (remover formatação)
    const cpfLimpo = cpf.replace(/\D/g, '')
    
    // Limpar telefone (remover formatação)
    const phoneLimpo = phone.replace(/\D/g, '')
    
    // Usar o valor fornecido ou o padrão
    const finalAmount = amount || 263.23
    const amountInCents = Math.round(finalAmount * 100)

    const url = 'https://api.freepaybr.com/functions/v1/transactions'
    
    // FREEPAY usa Basic Auth com SECRET_KEY:x
    const auth = 'Basic ' + Buffer.from(FREEPAY_SECRET_KEY + ':x').toString('base64')
    
    const payload = {
      paymentMethod: 'PIX',
      amount: amountInCents,
      items: [{
        title: 'Produto005',
        unitPrice: amountInCents,
        quantity: 1,
        externalRef: `PRODUTO005_${cpfLimpo}`
      }],
      customer: {
        document: { number: cpf },
        name: name,
        email: `${cpfLimpo}@temp.com`,
        phone: phoneLimpo
      },
      shipping: {
        street: 'Rua Exemplo',
        streetNumber: '123',
        zipCode: '12345678',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        complement: 'Apto 1'
      },
      description: 'Pagamento de Produto005',
      metadata: JSON.stringify({
        cpf: cpf,
        phone: phone,
        source: 'Organico-x1',
        timestamp: new Date().toISOString()
      })
    }

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
    console.log("[FREEPAY] Status:", response.status)

    if (!response.ok) {
      console.log("[FREEPAY] Error - Status:", response.status, "Response:", responseText)
      
      let errorMessage = `FREEPAY error: ${response.status}`
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (e) {
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
      console.log("[FREEPAY] Transaction created")
    } catch (parseError) {
      console.log("[FREEPAY] Failed to parse response as JSON:", parseError)
      return NextResponse.json({
        success: false,
        error: "Resposta inválida da FREEPAY",
        provider: 'freepay'
      }, { status: 500 })
    }

    // Extrair dados PIX da resposta FREEPAY
    const pixData = transactionData.pix
    const pixCode = pixData?.qrcode || transactionData.qrcode
    const transactionId = transactionData.id
    const expirationDate = pixData?.expirationDate

    console.log("[FREEPAY] PIX data extracted:", { pixData, pixCode, transactionId, expirationDate })

    if (!pixCode) {
      console.log("[FREEPAY] No PIX QR code found in response:", transactionData)
      return NextResponse.json({
        success: false,
        error: "Código PIX não foi gerado pela FREEPAY",
        provider: 'freepay'
      }, { status: 500 })
    }

    // Calcular tempo de expiração (30 minutos se não especificado)
    const expiresAt = expirationDate || new Date(Date.now() + 30 * 60 * 1000).toISOString()

    // Gerar QR Code usando API online
    let qrCodeImage = null
    try {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(pixCode)}`
      qrCodeImage = qrApiUrl
      console.log("[FREEPAY] QR Code URL generated successfully:", qrApiUrl)
    } catch (qrError) {
      console.log("[FREEPAY] Error generating QR Code URL:", qrError)
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
    console.error("[FREEPAY] Error creating PIX transaction:", error)
    
    if (error instanceof Error) {
      console.error("[FREEPAY] Error details:", {
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
