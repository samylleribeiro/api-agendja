# AgendJá Backend

Backend desenvolvido em equipe para o projeto acadêmico AgendJá, como parte da construção do projeto integrador(pi2)- Tecnologia em sistemas para internet

# Tecnologias Utilizadas
Node.js (Ambiente de execução)
Express (Framework para criação de rotas e servidor)
SQLite (Banco de dados relacional leve)
better-sqlite3 (Biblioteca para conexão e manipulação do banco de dados)

# Funcionalidades
A API permite o gerenciamento de:

Clientes
Profissionais
Agendamentos
Disponibilidade e orçamento
Avaliações de serviços

# 🔗 Rotas Disponíveis
👤 Clientes
Método	Rota	Descrição
GET	/clientes	Retorna a lista de clientes
GET	/clientes/:id	Retorna um cliente específico
POST	/clientes	Cadastra um novo cliente
PUT	/clientes/:id	Atualiza os dados de um cliente
PUT	/clientes/:id/senha	Atualiza a senha de um cliente
DELETE	/clientes/:id	Remove um cliente

👷 Profissionais
Método	Rota	Descrição
GET	/profissionais	Retorna a lista de profissionais
GET	/profissionais/:id	Retorna um profissional específico
POST	/profissionais	Cadastra um novo profissional
PUT	/profissionais/:id	Atualiza os dados de um profissional
PUT	/profissionais/:id/senha	Atualiza a senha de um profissional
DELETE	/profissionais/:id	Remove um profissional

📅 Agendamentos
Método	Rota	Descrição
GET	/agendamentos	Retorna a lista de agendamentos
GET	/agendamentos/:id	Retorna um agendamento específico
POST	/agendamentos	Cadastra um novo agendamento
PUT	/agendamentos/:id	Atualiza um agendamento
DELETE	/agendamentos/:id	Remove um agendamento

🕐 Disponibilidade e Orçamento
Método	Rota	Descrição
GET	/disponibilidade	Retorna todas as disponibilidades
GET	/disponibilidade/:profissional_id	Retorna as disponibilidades de um profissional
POST	/disponibilidade	Cadastra uma nova disponibilidade e orçamento

⭐ Avaliações
Método	Rota	Descrição
GET	/avaliacoes	Retorna todas as avaliações
GET	/avaliacoes/:profissional_id	Retorna as avaliações de um profissional
POST	/avaliacoes	Registra uma nova avaliação

# 📝 Exemplos de JSON
Cadastro de cliente

Para a rota POST /clientes:

{
    "nome": "Maria Silva",
    "cpf": "22233344455",
    "telefone": "88999998888",
    "senha": "xxxxx" <- adicione senha 
}
Cadastro de profissional

Para a rota POST /profissionais:

{
    "nome": "Carlos Sousa",
    "cpf": "11122233344",
    "telefone": "88999997777",
    "profissao": "Pedreiro",
    "senha": "xxxxx"
}
Cadastro de agendamento

Para a rota POST /agendamentos:

{
    "cliente_id": 2,
    "profissional_id": 2,
    "servico": "Pedreiro",
    "data": "31/08/2026",
    "horario": "08:00h",
    "orcamento": "R$ 150,00",
    "status": "Agendado"
}
Cadastro de disponibilidade

Para a rota POST /disponibilidade:

{
    "profissional_id": 2,
    "data": "05/09/2026",
    "horario": "14:00h",
    "orcamento": "R$ 150,00"
}
Cadastro de avaliação

Para a rota POST /avaliacoes:

{
    "cliente_id": 2,
    "profissional_id": 2,
    "agendamento_id": 2,
    "avaliacao": "Excelente"
}

# ▶️ Como executar o projeto?

Instale as dependências: npm install
Depois, execute o servidor: node server.js
A API estará disponível em: http://localhost:3000

# As tabelas utilizadas são:
clientes
profissionais
agendamentos
disponibilidade
avaliacoes

# Observações importantes:
Os dados utilizados nos exemplos são fictícios, utilizados nos testes de funcionamento da api.

O backend inicialmente foi criado independente, em uma etapa posterior será integrado com o front-end da agendjá.