import { type NextRequest, NextResponse } from "next/server"

// Usar variáveis de ambiente para segurança
const UNIPAY_SECRET_KEY = process.env.UNIPAY_SECRET_KEY || "sk_a0aab6155b590896932e3c92f49df02c59108c74"
const UNIPAY_API_URL = process.env.UNIPAY_API_URL || "https://api.unipaybr.com/api"

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

    const url = `${UNIPAY_API_URL}/transactions/${transactionId}`
    const auth = 'Basic ' + Buffer.from('x:' + UNIPAY_SECRET_KEY).toString('base64')

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
      let errorMessage = `Erro ao consultar status na UNIPAY: ${response.status}`
      
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorData.error || errorMessage
        
        // Tratamento específico de erros conforme documentação
        if (response.status === 401) {
          errorMessage = "Token inválido ou expirado. Verifique suas credenciais."
        } else if (response.status === 403) {
          errorMessage = "Token sem permissões para este recurso."
        }
      } catch (e) {
        // Usar mensagem padrão se não conseguir fazer parse
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        statusCode: response.status,
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
