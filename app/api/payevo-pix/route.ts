import { type NextRequest, NextResponse } from "next/server"

const PAYEVO_SECRET_KEY = "sk_live_m6PLpc8L0EBrZSMu6uacZ0zK6D3etfamVREGjoqicQNGzmx3"
const PAYEVO_COMPANY_ID = "4475bdde-d261-4fdf-a61c-94d98ffa8cf1"

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

    console.log("[v0] Creating PIX payment with PayEvo:", { cpf, name, phone, amount })

    // Limpar CPF (remover formatação)
    const cpfLimpo = cpf.replace(/\D/g, '')
    
    // Limpar telefone (remover formatação)
    const phoneLimpo = phone.replace(/\D/g, '')
    
    // Usar o valor fornecido ou o padrão
    const finalAmount = amount || 263.23
    const amountInCents = Math.round(finalAmount * 100)

    const url = 'https://api.payevo.com.br/functions/v1/transactions'
    
    // PayEvo usa Basic Auth com SECRET_KEY:x
    const auth = 'Basic ' + Buffer.from(PAYEVO_SECRET_KEY + ':x').toString('base64')
    
    console.log("[v0] PayEvo Auth header:", auth.substring(0, 30) + "...")

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

    console.log("[v0] PayEvo payload:", payload)

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
    console.log("[v0] PayEvo response status:", response.status)
    console.log("[v0] PayEvo response body:", responseText)

    if (!response.ok) {
      console.log("[v0] PayEvo error - Status:", response.status, "Response:", responseText)
      
      // Tentar extrair mensagem de erro da resposta
      let errorMessage = `PayEvo error: ${response.status}`
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
        provider: 'payevo'
      }, { status: response.status })
    }

    let transactionData
    try {
      transactionData = JSON.parse(responseText)
      console.log("[v0] PIX transaction created successfully:", transactionData)
    } catch (parseError) {
      console.log("[v0] Failed to parse PayEvo response as JSON:", parseError)
      return NextResponse.json({
        success: false,
        error: "Resposta inválida da PayEvo",
        provider: 'payevo'
      }, { status: 500 })
    }

    // Extrair dados PIX da resposta PayEvo
    console.log("[v0] Full transaction data:", JSON.stringify(transactionData, null, 2))
    
    const pixData = transactionData.pix
    const pixCode = pixData?.qrcode || transactionData.qrcode
    const transactionId = transactionData.id
    const expirationDate = pixData?.expirationDate
    const customerData = transactionData.customer

    console.log("[v0] PIX data extracted:", { pixData, pixCode, transactionId, expirationDate })

    if (!pixCode) {
      console.log("[v0] No PIX QR code found in response:", transactionData)
      return NextResponse.json({
        success: false,
        error: "Código PIX não foi gerado pela PayEvo",
        provider: 'payevo'
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
      provider: 'payevo',
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
    console.error("[v0] Error creating PayEvo PIX transaction:", error)
    
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
        provider: 'payevo',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
