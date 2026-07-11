# Coworking Space Management API
Esta é uma API que gerencia reservas de salas.

## Documentação
    A documentação usa o swagger, que gera automaticamente uma documentação sobre as rotas da API via a rota /api.

## Rotas da API
### Autenticação
    POST /auth/register → Cadastro de usuário.
    POST /auth/login → Login e geração do token JWT.
    POST /auth/forgot-password → Solicitação de redefinição de senha.
    POST /auth/reset-password → Redefinição de senha.
### Usuários
    GET /users/me → Retorna os dados do usuário autenticado.
    PUT /users/me → Atualiza os dados do usuário autenticado.
### Salas
    POST /rooms → Criação de uma sala (somente administradores).
    GET /rooms → Lista todas as salas disponíveis.
    GET /rooms/:id → Detalhes de uma sala.
    PUT /rooms/:id → Atualiza os dados de uma sala (somente administradores).
    PATCH /rooms/:id/status → Ativa/desativa uma sala (somente administradores).
    DELETE /rooms/:id → Remove uma sala (somente administradores).
### Reservas
    POST /reservations → Criação de uma nova reserva.
    GET /reservations → Lista todas as reservas do usuário autenticado.
    GET /reservations/:id → Detalhes de uma reserva.
    DELETE /reservations/:id → Cancela uma reserva (somente se faltarem mais de 24h).
    GET /reservations/history → Histórico de reservas do usuário.
### Administração
    GET /admin/reservations → Lista todas as reservas (somente administradores).
    DELETE /admin/reservations/:id → Remove uma reserva (somente administradores).
    PATCH /admin/users/:id → Eleva o status do usuário para ADMIN usando seu id
