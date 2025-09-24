# 🔍 UTMFY: Pixel vs Webhook - Diferenças e Configuração

## 📋 Visão Geral

A UTMFY tem duas formas de integração:

1. **Pixel (Frontend)** - Rastreamento de eventos no navegador
2. **Webhook (Backend)** - Notificações de vendas do servidor

## 🎯 Pixel UTMFY (Frontend)

### **O que é:**
- Script JavaScript que roda no navegador
- Rastreia eventos de navegação, cliques, conversões
- Envia dados em tempo real para UTMFY

### **Configuração atual:**
```javascript
// No layout.tsx
window.pixelId = "68230c0f5eee6a902ed7223a";
window.utmifyConfig = {
  apiToken: "IvzcwicXzvD9wEZvc3A8VCGJlxTfdz9J2gXq",
  debug: false
};
```

### **Erro corrigido:**
- **Antes**: `window.pixelId = "68d1d4068c6fc3b9fa178a58"` (ID incorreto)
- **Depois**: `window.pixelId = "68230c0f5eee6a902ed7223a"` (ID correto fornecido)
- **Adicionado**: Configuração de API token e tratamento de erros

## 🔗 Webhook UTMFY (Backend)

### **O que é:**
- API endpoint que recebe notificações da FreePay
- Envia dados de vendas para UTMFY via API
- Funciona no servidor, não no navegador

### **Configuração atual:**
```typescript
// No webhook FreePay
const response = await fetch("https://api.utmify.com.br/api-credentials/orders", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-token": "IvzcwicXzvD9wEZvc3A8VCGJlxTfdz9J2gXq"
  },
  body: JSON.stringify(utmfyPayload)
});
```

## 🔄 Como Funcionam Juntos

### **Fluxo Completo:**

1. **Usuário acessa o site** → Pixel rastreia navegação
2. **Usuário gera PIX** → Pixel rastreia evento de conversão
3. **FreePay processa pagamento** → Webhook recebe notificação
4. **Webhook envia para UTMFY** → Venda é registrada

### **Dados do Pixel:**
- Navegação do usuário
- Cliques e interações
- Parâmetros UTM da URL
- Eventos de conversão

### **Dados do Webhook:**
- Informações da venda
- Dados do cliente
- Status do pagamento
- Valores e comissões

## 🚨 Problemas e Soluções

### **Erro 400 no Pixel:**
```
POST https://tracking.utmify.com.br/tracking/v1/events 400 (Bad Request)
```

**Causa**: Pixel ID incorreto ou configuração inválida
**Solução**: ✅ Corrigido com ID correto e configuração adequada

### **Pixel não carrega:**
**Sintomas**: Erro no console, pixel não funciona
**Solução**: ✅ Adicionado tratamento de erros e logs

### **Webhook não envia:**
**Sintomas**: Vendas não aparecem na UTMFY
**Solução**: ✅ Implementado com logs detalhados para debug

## 📊 Logs Esperados

### **Pixel (Frontend):**
```
[UTMFY] Pixel carregado com sucesso
```

### **Webhook (Backend):**
```
[FreePay Webhook] Received postback: {...}
[FreePay Webhook] Starting UTMFY notification: {...}
[FreePay Webhook] UTMFY notification sent successfully: {...}
```

## 🛠️ Configuração Completa

### **1. Pixel (Frontend) - ✅ Configurado**
- ID correto: `68230c0f5eee6a902ed7223a`
- API Token: `IvzcwicXzvD9wEZvc3A8VCGJlxTfdz9J2gXq`
- Tratamento de erros implementado

### **2. Webhook (Backend) - ✅ Configurado**
- Endpoint: `https://api.utmify.com.br/api-credentials/orders`
- API Token: `IvzcwicXzvD9wEZvc3A8VCGJlxTfdz9J2gXq`
- Logs detalhados implementados

## 🔍 Debug

### **Verificar Pixel:**
1. Abrir DevTools (F12)
2. Ir para Console
3. Procurar por: `[UTMFY] Pixel carregado com sucesso`
4. Verificar se não há erros 400

### **Verificar Webhook:**
1. Gerar um PIX
2. Verificar logs do servidor
3. Procurar por: `[FreePay Webhook] UTMFY notification sent successfully`

## 📈 Benefícios da Integração Dupla

### **Pixel (Frontend):**
- ✅ Rastreamento de navegação
- ✅ Análise de comportamento
- ✅ Otimização de campanhas
- ✅ Dados em tempo real

### **Webhook (Backend):**
- ✅ Dados precisos de vendas
- ✅ Informações de pagamento
- ✅ Rastreamento de comissões
- ✅ Dados confiáveis do servidor

## 🆘 Próximos Passos

1. **Testar o pixel** - Verificar se não há mais erros 400
2. **Gerar PIX de teste** - Verificar se webhook funciona
3. **Verificar UTMFY** - Confirmar se dados aparecem
4. **Monitorar logs** - Acompanhar funcionamento

---

**Status**: ✅ Pixel e Webhook configurados
**Última atualização**: Janeiro 2024
