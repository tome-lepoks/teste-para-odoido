import { type NextRequest, NextResponse } from "next/server"
import { pixRouter } from "@/lib/pix-router"

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

    // Determinar qual API usar baseado na distribuição 3:1
    const selectedProvider = pixRouter.recordTransaction()
    
    console.log(`[PIX Router] Selected provider: ${selectedProvider.toUpperCase()}`)
    console.log(`[PIX Router] Current stats:`, pixRouter.getStats())

    // Fazer a requisição para a API selecionada
    const apiUrl = selectedProvider === 'unipay' 
      ? `${request.nextUrl.origin}/api/unipay-pix`
      : `${request.nextUrl.origin}/api/freepay-pix`

    console.log(`[PIX Router] Calling API: ${apiUrl}`)

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, cpf, name, phone }),
    })

    const apiResult = await apiResponse.json()

    // Adicionar informações do roteamento na resposta
    const response = {
      ...apiResult,
      routing: {
        selectedProvider,
        stats: pixRouter.getStats()
      }
    }

    console.log(`[PIX Router] Response from ${selectedProvider}:`, {
      success: response.success,
      provider: response.provider,
      transactionId: response.transactionId
    })

    return NextResponse.json(response, { status: apiResponse.status })

  } catch (error) {
    console.error("[PIX Router] Error in main endpoint:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor",
        provider: 'router',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Endpoint para consultar estatísticas do roteamento
export async function GET() {
  try {
    const stats = pixRouter.getStats()
    
    return NextResponse.json({
      success: true,
      stats,
      message: "Estatísticas do roteamento PIX"
    })
  } catch (error) {
    console.error("[PIX Router] Error getting stats:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao obter estatísticas"
      },
      { status: 500 }
    )
  }
}
