# Solução para Erro "Erro ao gerar PIX. Tente novamente."

## Problema Identificado
O erro está ocorrendo porque o Node.js/npm não está instalado ou não está no PATH do sistema.

## Soluções

### 1. Instalar Node.js
Baixe e instale o Node.js do site oficial: https://nodejs.org/

### 2. Verificar Instalação
Após instalar, abra um novo terminal e execute:
```bash
node --version
npm --version
```

### 3. Executar o Projeto
```bash
npm install
npm run dev
```

### 4. Testar a Integração
Acesse: http://localhost:3000

## Correções Realizadas na Integração

### ✅ URL da API Corrigida
- **Anterior**: `https://api.unipaybr.com/api`
- **Correto**: `https://api.fastsoftbrasil.com/api`

### ✅ Autenticação Corrigida
```typescript
const auth = 'Basic ' + Buffer.from(`x:${UNIPAY_SECRET_KEY}`).toString('base64')
```

### ✅ Payload Otimizado
- Validação de CPF (11 dígitos)
- Validação de telefone (mínimo 10 dígitos)
- Formato correto de email
- Metadata como string JSON
- IP e traceable configurados

### ✅ Logs Detalhados
- URL da API
- Header de autenticação
- Payload completo
- Resposta da API

## Arquivos Atualizados
- `app/api/payevo-pix/route.ts` - Endpoint principal
- `app/api/payevo-status/route.ts` - Consulta de status
- `app/api/test-unipay/route.ts` - Endpoint de teste

## Teste de Conectividade
Use o endpoint: `/api/test-unipay` para testar a conexão com a API UNIPAY.

## Próximos Passos
1. Instalar Node.js
2. Executar `npm install`
3. Executar `npm run dev`
4. Testar a geração de PIX
5. Verificar logs no console para debugging
