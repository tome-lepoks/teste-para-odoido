import { type NextRequest, NextResponse } from "next/server"

// FREEPAY Configuration
const FREEPAY_SECRET_KEY = "sk_live_C4C97UanuShcerwwfBIWYnTdqthmTrh2s5hYXBntPdb8q3bL"
const FREEPAY_API_URL = "https://api.freepaybr.com/functions/v1"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('transactionId')

    if (!transactionId) {
      return NextResponse.json({
        success: false,
        error: "ID da transação é obrigatório"
      }, { status: 400 })
    }

    console.log("[v0] Checking FREEPAY transaction status:", transactionId)

    // FREEPAY API Configuration
    const url = `${FREEPAY_API_URL}/transactions/${transactionId}`
    
    // FREEPAY usa Basic Auth com SECRET_KEY:x
    const auth = 'Basic ' + Buffer.from(`${FREEPAY_SECRET_KEY}:x`).toString('base64')

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Accept': 'application/json'
      }
    })

    const responseText = await response.text()
    console.log("[v0] FREEPAY status response:", responseText)

    if (!response.ok) {
      console.log("[v0] FREEPAY status error - Status:", response.status, "Response:", responseText)
      return NextResponse.json({
        success: false,
        error: `Erro ao consultar status: ${response.status}`,
        provider: 'freepay'
      }, { status: response.status })
    }

    let transactionData
    try {
      transactionData = JSON.parse(responseText)
      console.log("[v0] Transaction status retrieved:", transactionData)
    } catch (parseError) {
      console.log("[v0] Failed to parse FREEPAY status response:", parseError)
      return NextResponse.json({
        success: false,
        error: "Resposta inválida da FREEPAY",
        provider: 'freepay'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      transactionId: transactionData.id,
      status: transactionData.status,
      amount: transactionData.amount,
      paidAt: transactionData.paidAt,
      createdAt: transactionData.createdAt,
      updatedAt: transactionData.updatedAt,
      customer: transactionData.customer,
      provider: 'freepay'
    })

  } catch (error) {
    console.error("[v0] Error checking FREEPAY transaction status:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor",
        provider: 'freepay'
      },
      { status: 500 }
    )
  }
}
