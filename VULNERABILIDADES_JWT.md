# TechStore - Vulnerabilidades JWT Implementadas

Este documento detalha as vulnerabilidades de segurança intencionalmente implementadas na aplicação TechStore para fins educacionais e testes de penetração.

## ⚠️ AVISO IMPORTANTE
Esta aplicação contém vulnerabilidades de segurança INTENCIONAIS para fins de aprendizado e demonstração de falhas de segurança. NUNCA use essas práticas em aplicações de produção.

## 🎯 Vulnerabilidades JWT Implementadas

### 1. **Chave JWT Fraca e Hardcoded**
- **Local**: `server/routes.ts` linha 8
- **Vulnerabilidade**: Chave JWT "weak123" hardcoded no código
- **Exploração**: A chave pode ser descoberta através de:
  - Análise do código fonte
  - Endpoint `/api/debug/jwt` (exposição intencional)
  - Força bruta devido à simplicidade

### 2. **Algoritmo "none" Aceito**
- **Local**: `server/routes.ts` linha 20
- **Vulnerabilidade**: JWT aceita algoritmo "none" permitindo bypass de verificação
- **Exploração**: 
  ```bash
  # Token JWT com algoritmo "none"
  eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9.
  ```

### 3. **Informações Sensíveis no JWT**
- **Local**: `server/routes.ts` linhas 45-51 e 77-83
- **Vulnerabilidade**: Senha hasheada incluída no payload do JWT
- **Exploração**: Decodificar JWT base64 revela dados sensíveis

### 4. **Expiração Excessivamente Longa**
- **Local**: `server/routes.ts` linhas 51 e 83
- **Vulnerabilidade**: JWT expira em 365 dias (muito longo)
- **Exploração**: Tokens comprometidos permanecem válidos por muito tempo

### 5. **Logs Detalhados de Erro JWT**
- **Local**: `server/routes.ts` linhas 22-24
- **Vulnerabilidade**: Console.log expõe tokens JWT em logs
- **Exploração**: Acesso aos logs do servidor revela tokens

### 6. **Endpoint de Debug JWT**
- **Local**: `server/routes.ts` linhas 211-238
- **Vulnerabilidade**: Endpoint `/api/debug/jwt` expõe informações críticas
- **Exploração**: GET `/api/debug/jwt` com header Authorization

### 7. **Exposição de Detalhes de Erro**
- **Local**: `server/routes.ts` linhas 57-65 e 95-103
- **Vulnerabilidade**: Stack traces expostos nas respostas de erro
- **Exploração**: Requests malformados revelam estrutura interna

### 8. **Endpoint Admin Desprotegido**
- **Local**: `server/routes.ts` linhas 241-248
- **Vulnerabilidade**: `/api/admin/users` sem autenticação adequada
- **Exploração**: GET `/api/admin/users` retorna todos os dados dos usuários

## 🔧 Como Explorar com Burp Suite

### Configuração Inicial
1. Configure o Burp Suite como proxy (porta 8080)
2. Configure o navegador para usar o proxy
3. Navegue até a aplicação em `http://localhost:5000`

### Exploração 1: Descoberta da Chave JWT
```http
GET /api/debug/jwt HTTP/1.1
Host: localhost:5000
```

### Exploração 2: JWT com Algoritmo "none"
1. Capture uma requisição autenticada no Burp
2. Modifique o header JWT para:
   ```json
   {"alg": "none", "typ": "JWT"}
   ```
3. Remova a assinatura, mantendo apenas o ponto final
4. Envie a requisição modificada

### Exploração 3: Forjar JWT com Chave Conhecida
```bash
# Use a chave "weak123" para criar JWTs falsos
# Payload exemplo:
{
  "userId": 999,
  "email": "admin@hacker.com",
  "name": "Admin Hacker",
  "role": "admin",
  "password": "fake_hash",
  "exp": 9999999999
}
```

### Exploração 4: Acesso a Dados Sensíveis
```http
GET /api/admin/users HTTP/1.1
Host: localhost:5000
```

### Exploração 5: Extração de Informações do JWT
1. Capture qualquer JWT válido
2. Decodifique usando base64 para ver dados sensíveis
3. Use o endpoint debug para confirmar estrutura

## 🛡️ Como Corrigir (Para Aprendizado)

### Correções Recomendadas:
1. **Chave Forte**: Use chaves de 256+ bits, armazenadas em variáveis de ambiente
2. **Algoritmo Fixo**: Especifique apenas algoritmos seguros (HS256, RS256)
3. **Payload Mínimo**: Inclua apenas dados não sensíveis (userId, roles)
4. **Expiração Curta**: 15-60 minutos máximo
5. **Logs Seguros**: Nunca faça log de tokens ou dados sensíveis
6. **Sem Endpoints de Debug**: Remova em produção
7. **Tratamento de Erro**: Mensagens genéricas, sem stack traces
8. **Autenticação Adequada**: Proteja endpoints administrativos

## 🔍 Endpoints Vulneráveis para Teste

1. `POST /api/auth/login` - Teste força bruta, injeção
2. `POST /api/auth/register` - Teste registros maliciosos
3. `GET /api/debug/jwt` - Exposição de informações
4. `GET /api/admin/users` - Acesso não autorizado
5. `GET /api/auth/me` - Teste JWT manipulation
6. `POST /api/cart/add` - Teste autorização bypass

## 📋 Cenários de Teste Sugeridos

1. **Descoberta de Informações**: Enumere endpoints, analise respostas
2. **Manipulação de JWT**: Modifique algoritmos, payloads, assinaturas
3. **Privilege Escalation**: Tente elevar privilégios via JWT
4. **Bypass de Autenticação**: Use algoritmo "none", chaves fracas
5. **Information Disclosure**: Explore endpoints de debug e admin

## 🎓 Objetivos de Aprendizado

Ao explorar essas vulnerabilidades, você aprenderá:
- Como funcionam os JWTs internamente
- Principais falhas de implementação
- Técnicas de exploração com Burp Suite
- Importância da configuração segura
- Melhores práticas de segurança JWT

---
**Lembre-se**: Use este conhecimento apenas para fins educacionais e testes autorizados!