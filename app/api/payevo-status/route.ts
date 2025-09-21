import { type NextRequest, NextResponse } from "next/server"

const UNIPAY_SECRET_KEY = "sk_a0aab6155b590896932e3c92f49df02c59108c74"
const UNIPAY_API_URL = "https://api.fastsoftbrasil.com/api"

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

    console.log("[v0] Checking UNIPAY transaction status:", transactionId)

    const url = `${UNIPAY_API_URL}/user/transactions/${transactionId}`
    
    // UNIPAY usa Basic Auth com x:SECRET_KEY
    const auth = 'Basic ' + Buffer.from(`x:${UNIPAY_SECRET_KEY}`).toString('base64')

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Accept': 'application/json'
      }
    })

    const responseText = await response.text()
    console.log("[v0] UNIPAY status response:", responseText)

    if (!response.ok) {
      console.log("[v0] UNIPAY status error - Status:", response.status, "Response:", responseText)
      return NextResponse.json({
        success: false,
        error: `Erro ao consultar status: ${response.status}`,
        provider: 'unipay'
      }, { status: response.status })
    }

    let transactionData
    try {
      transactionData = JSON.parse(responseText)
      console.log("[v0] Transaction status retrieved:", transactionData)
    } catch (parseError) {
      console.log("[v0] Failed to parse UNIPAY status response:", parseError)
      return NextResponse.json({
        success: false,
        error: "Resposta inválida da UNIPAY",
        provider: 'unipay'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      transactionId: transactionData.id || transactionData.transactionId,
      status: transactionData.status,
      amount: transactionData.amount,
      paidAt: transactionData.paidAt,
      createdAt: transactionData.createdAt,
      updatedAt: transactionData.updatedAt,
      customer: transactionData.customer,
      provider: 'unipay'
    })

  } catch (error) {
    console.error("[v0] Error checking UNIPAY transaction status:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor",
        provider: 'unipay'
      },
      { status: 500 }
    )
  }
}
