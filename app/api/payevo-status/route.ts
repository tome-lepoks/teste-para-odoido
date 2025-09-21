import { type NextRequest, NextResponse } from "next/server"

const PAYEVO_SECRET_KEY = "sk_live_m6PLpc8L0EBrZSMu6uacZ0zK6D3etfamVREGjoqicQNGzmx3"

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

    console.log("[v0] Checking PayEvo transaction status:", transactionId)

    const url = `https://api.payevo.com.br/functions/v1/transactions/${transactionId}`
    
    // PayEvo usa Basic Auth com SECRET_KEY:x
    const auth = 'Basic ' + Buffer.from(PAYEVO_SECRET_KEY + ':x').toString('base64')

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Accept': 'application/json'
      }
    })

    const responseText = await response.text()
    console.log("[v0] PayEvo status response:", responseText)

    if (!response.ok) {
      console.log("[v0] PayEvo status error - Status:", response.status, "Response:", responseText)
      return NextResponse.json({
        success: false,
        error: `Erro ao consultar status: ${response.status}`,
        provider: 'payevo'
      }, { status: response.status })
    }

    let transactionData
    try {
      transactionData = JSON.parse(responseText)
      console.log("[v0] Transaction status retrieved:", transactionData)
    } catch (parseError) {
      console.log("[v0] Failed to parse PayEvo status response:", parseError)
      return NextResponse.json({
        success: false,
        error: "Resposta inválida da PayEvo",
        provider: 'payevo'
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
      provider: 'payevo'
    })

  } catch (error) {
    console.error("[v0] Error checking PayEvo transaction status:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor",
        provider: 'payevo'
      },
      { status: 500 }
    )
  }
}
