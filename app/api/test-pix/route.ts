import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json()
    
    if (!provider || !['unipay', 'freepay'].includes(provider)) {
      return NextResponse.json({ 
        success: false, 
        error: "Provider deve ser 'unipay' ou 'freepay'" 
      }, { status: 400 })
    }

    console.log(`[TEST] Testing ${provider} API`)

    // Dados de teste
    const testData = {
      amount: 263.23,
      cpf: "12345678900",
      name: "Teste Usuario",
      phone: "11999999999"
    }

    // Fazer requisição para a API de teste
    const apiUrl = provider === 'unipay' 
      ? `${request.nextUrl.origin}/api/unipay-pix`
      : `${request.nextUrl.origin}/api/freepay-pix`

    console.log(`[TEST] Calling: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    })

    const result = await response.json()

    return NextResponse.json({
      success: true,
      provider,
      status: response.status,
      result: {
        success: result.success,
        error: result.error,
        provider: result.provider
      }
    })

  } catch (error) {
    console.error("[TEST] Error:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor"
      },
      { status: 500 }
    )
  }
}
