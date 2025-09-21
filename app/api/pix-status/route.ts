import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { transactionId, provider } = await request.json()
    
    if (!transactionId) {
      return NextResponse.json({ 
        success: false, 
        error: "Transaction ID é obrigatório" 
      }, { status: 400 })
    }

    if (!provider || !['unipay', 'freepay'].includes(provider)) {
      return NextResponse.json({ 
        success: false, 
        error: "Provider deve ser 'unipay' ou 'freepay'" 
      }, { status: 400 })
    }

    console.log(`[PIX Status] Checking status for ${provider} transaction:`, transactionId)

    let apiUrl: string
    let auth: string

    if (provider === 'unipay') {
      const UNIPAY_PUBLIC_KEY = "pk_b43b6992da8621f3940d675ed1a5f954091fb37e"
      const UNIPAY_SECRET_KEY = "sk_a0aab6155b590896932e3c92f49df02c59108c74"
      apiUrl = `https://api.fastsoftbrasil.com/api/user/transactions/${transactionId}`
      auth = 'Basic ' + Buffer.from(UNIPAY_PUBLIC_KEY + ':' + UNIPAY_SECRET_KEY).toString('base64')
    } else {
      const FREEPAY_SECRET_KEY = "sk_live_C4C97UanuShcerwwfBIWYnTdqthmTrh2s5hYXBntPdb8q3bL"
      apiUrl = `https://api.freepaybr.com/functions/v1/transactions/${transactionId}`
      auth = 'Basic ' + Buffer.from(FREEPAY_SECRET_KEY + ':x').toString('base64')
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Accept': 'application/json'
      }
    })

    const responseText = await response.text()
    console.log(`[PIX Status] ${provider.toUpperCase()} response:`, response.status, responseText)

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Erro ao consultar status na ${provider.toUpperCase()}: ${response.status}`,
        provider
      }, { status: response.status })
    }

    let transactionData
    try {
      transactionData = JSON.parse(responseText)
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: "Resposta inválida da API",
        provider
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      transactionId,
      provider,
      status: transactionData.status,
      amount: transactionData.amount,
      paidAt: transactionData.paidAt,
      createdAt: transactionData.createdAt,
      updatedAt: transactionData.updatedAt,
      customer: transactionData.customer,
      pix: transactionData.pix
    })

  } catch (error) {
    console.error("[PIX Status] Error checking transaction status:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
