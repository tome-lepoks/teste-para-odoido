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
    
    // Log discreto apenas para debugging interno
    console.log(`[PIX] Provider: ${selectedProvider}`)

    // Fazer a requisição para a API selecionada
    const apiUrl = selectedProvider === 'unipay' 
      ? `${request.nextUrl.origin}/api/unipay-pix`
      : `${request.nextUrl.origin}/api/freepay-pix`

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, cpf, name, phone }),
    })

    const apiResult = await apiResponse.json()

    // Log discreto apenas para debugging interno
    console.log(`[PIX] ${selectedProvider} response:`, apiResult.success ? 'OK' : 'ERROR')

    return NextResponse.json(apiResult, { status: apiResponse.status })

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

// Endpoint GET removido para não expor informações de roteamento
