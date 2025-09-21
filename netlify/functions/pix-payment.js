// Netlify Function para PIX Payment
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
    const { amount, cpf, name, phone } = JSON.parse(event.body);
    
    // Validações obrigatórias
    if (!cpf) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: "CPF é obrigatório" 
        }),
      };
    }

    if (!name) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: "Nome é obrigatório" 
        }),
      };
    }

    if (!phone) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: "Telefone é obrigatório" 
        }),
      };
    }

    // Simular roteamento 3:1 (UNIPAY:FREEPAY)
    const transactionCount = Math.floor(Math.random() * 4) + 1;
    const useUnipay = transactionCount <= 3;
    const selectedProvider = useUnipay ? 'unipay' : 'freepay';

    console.log(`[Netlify] Selected provider: ${selectedProvider}`);

    // Simular resposta de sucesso
    const mockResponse = {
      success: true,
      pixCode: `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 15)}5204000053039865405263.235802BR5913Teste Usuario6008Brasilia62070503***6304${Math.random().toString(36).substring(2, 6)}`,
      qrCodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(`00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 15)}5204000053039865405263.235802BR5913Teste Usuario6008Brasilia62070503***6304${Math.random().toString(36).substring(2, 6)}`)}`,
      amount: amount || 263.23,
      transactionId: `TXN_${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      provider: selectedProvider,
      status: 'waiting_payment',
      customer: {
        name: name,
        email: `${cpf.replace(/\D/g, '')}@temp.com`,
        phone: phone
      },
      metadata: {
        cpf: cpf,
        phone: phone,
        source: 'Organico-x1',
        timestamp: new Date().toISOString()
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
        provider: 'netlify',
        timestamp: new Date().toISOString()
      }),
    };
  }
};
