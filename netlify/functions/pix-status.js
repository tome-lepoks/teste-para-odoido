// Netlify Function para PIX Status
exports.handler = async (event, context) => {
  // Permitir CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Responder a requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Apenas permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { transactionId, provider } = JSON.parse(event.body);
    
    if (!transactionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: "Transaction ID é obrigatório" 
        }),
      };
    }

    if (!provider || !['unipay', 'freepay'].includes(provider)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: "Provider deve ser 'unipay' ou 'freepay'" 
        }),
      };
    }

    console.log(`[Netlify] Checking status for ${provider} transaction:`, transactionId);

    // Simular resposta de status
    const statuses = ['waiting_payment', 'paid', 'expired', 'cancelled'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    const mockResponse = {
      success: true,
      transactionId,
      provider,
      status: randomStatus,
      amount: 26323,
      paidAt: randomStatus === 'paid' ? new Date().toISOString() : null,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      customer: {
        name: "Teste Usuario",
        email: "teste@temp.com",
        phone: "11999999999"
      },
      pix: {
        qrcode: `https://digital.mundipagg.com/pix/${transactionId}`,
        expirationDate: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
        end2EndId: null,
        receiptUrl: randomStatus === 'paid' ? `https://receipt.example.com/${transactionId}` : null
      }
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(mockResponse),
    };

  } catch (error) {
    console.error('[Netlify] Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do servidor',
        timestamp: new Date().toISOString()
      }),
    };
  }
};
