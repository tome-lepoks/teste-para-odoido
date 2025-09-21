import { type NextRequest, NextResponse } from "next/server"

const UNIPAY_SECRET_KEY = "sk_a0aab6155b590896932e3c92f49df02c59108c74"

export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json()
    
    if (!transactionId) {
      return NextResponse.json({ 
        success: false, 
        error: "Transaction ID é obrigatório" 
      }, { status: 400 })
    }

    console.log(`[UNIPAY] Checking status for transaction:`, transactionId)

    const url = `https://api.unipaybr.com/api/transactions/${transactionId}`
    const auth = 'Basic ' + Buffer.from(UNIPAY_SECRET_KEY + ':x').toString('base64')

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Accept': 'application/json'
      }
    })

    const responseText = await response.text()
    console.log(`[UNIPAY] Response status:`, response.status)
    console.log(`[UNIPAY] Response body:`, responseText)

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Erro ao consultar status na UNIPAY: ${response.status}`,
        provider: 'unipay'
      }, { status: response.status })
    }

    let transactionData
    try {
      transactionData = JSON.parse(responseText)
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: "Resposta inválida da API",
        provider: 'unipay'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      transactionId,
      provider: 'unipay',
      status: transactionData.status,
      amount: transactionData.amount,
      paidAt: transactionData.paidAt,
      createdAt: transactionData.createdAt,
      updatedAt: transactionData.updatedAt,
      customer: transactionData.customer,
      pix: transactionData.pix
    })

  } catch (error) {
    console.error("[UNIPAY] Error checking transaction status:", error)
    
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
