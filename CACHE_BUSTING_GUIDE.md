# 🔄 Cache Busting - Resolvendo Problemas de Cache do Pixel UTMFY

## 🚨 Problema Identificado

O pixel UTMFY ainda está usando o ID antigo (`68c6eb2bb8b1a1819d23c020`) em vez do novo (`68230c0f5eee6a902ed7223a`), causando erro 400.

## 🔧 Soluções Implementadas

### **1. Cache Busting no Script**
```javascript
script.src = "https://cdn.utmify.com.br/scripts/pixel/pixel.js?v=" + Date.now();
```
- Adiciona timestamp único para forçar download do script atualizado

### **2. Limpeza de Scripts Antigos**
```javascript
var oldScripts = document.querySelectorAll('script[src*="pixel.js"]');
oldScripts.forEach(function(script) {
  script.remove();
});
```
- Remove scripts antigos antes de carregar o novo

### **3. Limpeza de Configurações Antigas**
```javascript
if (window.utmify) {
  delete window.utmify;
}
```
- Remove configurações antigas do objeto global

### **4. Debug Ativado**
```javascript
window.utmifyConfig = {
  apiToken: "IvzcwicXzvD9wEZvc3A8VCGJlxTfdz9J2gXq",
  debug: true  // ← Ativado para mais logs
};
```

## 🛠️ Passos para Resolver

### **1. Limpar Cache do Navegador**
- **Chrome/Edge**: Ctrl+Shift+R (hard refresh)
- **Firefox**: Ctrl+F5
- **Safari**: Cmd+Shift+R

### **2. Limpar Cache do Site**
- Abrir DevTools (F12)
- Clicar com botão direito no botão de refresh
- Selecionar "Empty Cache and Hard Reload"

### **3. Verificar Console**
Procurar por:
```
[UTMFY] Pixel carregado com sucesso - ID: 68230c0f5eee6a902ed7223a
```

### **4. Verificar Network Tab**
- Ir para DevTools → Network
- Procurar por requisições para `tracking.utmify.com.br`
- Verificar se o ID correto está sendo enviado

## 🔍 Debug Avançado

### **Verificar Configuração Atual**
```javascript
// No console do navegador
console.log("Pixel ID:", window.pixelId);
console.log("UTMFY Config:", window.utmifyConfig);
console.log("UTMFY Object:", window.utmify);
```

### **Forçar Recarregamento do Pixel**
```javascript
// No console do navegador
if (window.utmify && window.utmify.reload) {
  window.utmify.reload();
}
```

### **Verificar Requisições**
1. Abrir DevTools → Network
2. Filtrar por "utmify"
3. Verificar se as requisições usam o ID correto
4. Verificar status das respostas (deve ser 200, não 400)

## 🚨 Se o Problema Persistir

### **Opção 1: Desabilitar Pixel Temporariamente**
```javascript
// No layout.tsx, comentar o script do pixel
// e testar apenas o webhook
```

### **Opção 2: Usar Modo Incógnito**
- Abrir site em aba anônima/privada
- Testar se o pixel funciona sem cache

### **Opção 3: Verificar Configuração na UTMFY**
1. Acessar dashboard da UTMFY
2. Verificar se o pixel ID está correto
3. Verificar se a conta está ativa
4. Verificar se há restrições de domínio

## 📊 Logs Esperados

### **Sucesso:**
```
[UTMFY] Pixel carregado com sucesso - ID: 68230c0f5eee6a902ed7223a
```

### **Erro (se persistir):**
```
[UTMFY] Erro ao carregar pixel
```

## 🔄 Teste Completo

### **1. Limpar Cache**
- Hard refresh (Ctrl+Shift+R)

### **2. Verificar Console**
- Deve aparecer log de sucesso
- Não deve ter erros 400

### **3. Verificar Network**
- Requisições para UTMFY devem ter status 200
- ID correto deve ser enviado

### **4. Testar Funcionalidade**
- Navegar pelo site
- Verificar se eventos são rastreados
- Gerar PIX e verificar webhook

## 🆘 Próximos Passos

1. **Limpar cache** do navegador
2. **Recarregar página** com hard refresh
3. **Verificar console** para logs de sucesso
4. **Testar funcionalidade** do pixel
5. **Se persistir erro**, verificar configuração na UTMFY

---

**Status**: 🔄 Cache busting implementado
**Última atualização**: Janeiro 2024
