# TechStore - Loja Virtual Vulnerável

## Visão Geral
Aplicação de e-commerce completa para loja de informática com vulnerabilidades intencionais de JWT para fins educacionais e testes de penetração com Burp Suite.

## Funcionalidades Implementadas
- Catálogo completo de produtos (computadores, notebooks, periféricos)
- Sistema de autenticação com JWT (intencionalmente vulnerável)
- Carrinho de compras com funcionalidades completas
- Busca e filtros por categoria e preço
- Interface responsiva moderna
- Armazenamento em memória com produtos de exemplo

## Arquitetura
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + JWT
- **Autenticação**: JWT com vulnerabilidades intencionais
- **Banco de Dados**: PostgreSQL com Drizzle ORM
- **Armazenamento**: DatabaseStorage (PostgreSQL)
- **Roteamento**: Wouter

## Vulnerabilidades JWT Implementadas
1. Chave JWT fraca e hardcoded ("weak123")
2. Algoritmo "none" aceito na verificação
3. Informações sensíveis no payload (senhas hasheadas)
4. Expiração excessivamente longa (365 dias)
5. Logs detalhados de erro expondo tokens
6. Endpoint de debug JWT (`/api/debug/jwt`)
7. Exposição de stack traces em erros
8. Endpoint admin desprotegido (`/api/admin/users`)

## Endpoints Vulneráveis
- `GET /api/debug/jwt` - Expõe chave JWT e informações do token
- `GET /api/admin/users` - Lista todos usuários sem autenticação
- `POST /api/auth/login` - Aceita JWT com algoritmo "none"
- `POST /api/auth/register` - Expõe detalhes de erro

## Mudanças Recentes
- **14/06/2025**: Implementadas vulnerabilidades JWT intencionais
- **14/06/2025**: Corrigido problema de autenticação após cadastro
- **14/06/2025**: Adicionados endpoints vulneráveis para testes
- **14/06/2025**: Criada documentação de vulnerabilidades

## Estado Atual
A aplicação está funcional e pronta para testes de segurança. Todas as vulnerabilidades JWT foram implementadas conforme solicitado para demonstração com Burp Suite.

## Próximos Passos
- Testar vulnerabilidades com Burp Suite
- Documentar cenários de exploração
- Validar funcionamento dos endpoints vulneráveis