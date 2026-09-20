// Pega o Express instalado no projeto
const express = require("express");
// Pega o Better SQLite3 instalado no projeto
const Database = require("better-sqlite3");
// Cria uma instância(aplicativo) do Express
const app = express();
// permite que o Express entenda requisições com corpo em JSON
app.use(express.json());
// Conecta ao banco de dados
const banco = new Database("agendja.db");
// ROTAS CLIENTES
// Rota para consultar os clientes
app.get("/clientes", (req, res) => {
    const clientes = banco
        .prepare("SELECT id, nome, cpf, telefone FROM clientes")
        .all();

    res.json(clientes);
});
// Rota para cadastrar um novo cliente
app.post("/clientes", (req, res) => {
    const { nome, cpf, telefone, senha } = req.body;

    const stmt = banco.prepare(`
        INSERT INTO clientes (nome, cpf, telefone, senha)
        VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(nome, cpf, telefone, senha);

    res.status(201).json({
        id: result.lastInsertRowid,
        nome,
        cpf,
        telefone
    });
});
// Rota para consultar um cliente específico
app.get("/clientes/:id", (req, res) => {
    const { id } = req.params;

    const cliente = banco
        .prepare("SELECT id, nome, cpf, telefone FROM clientes WHERE id = ?")
        .get(id);

    if (!cliente) {
        return res.status(404).json({ error: "Cliente não encontrado" });
    }

    res.json(cliente);
});
// Rota para deletar um cliente específico
app.delete("/clientes/:id", (req, res) => {
    const { id } = req.params;

    const stmt = banco.prepare("DELETE FROM clientes WHERE id = ?");
    const result = stmt.run(id);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Cliente não encontrado" });
    }

    res.status(200).json({ message: "Cliente deletado com sucesso" });
});
// Rota para atualizar informações de um cliente específico
app.put("/clientes/:id", (req, res) => {
    const { id } = req.params;
    const { nome, cpf, telefone, senha } = req.body;

    const stmt = banco.prepare("UPDATE clientes SET nome = ?, cpf = ?, telefone = ?, senha = ? WHERE id = ?");
    const result = stmt.run(nome, cpf, telefone, senha, id);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Cliente não encontrado" });
    }

    res.status(200).json({ message: "Informações do cliente atualizadas com sucesso" });
});
// Rota para atualizar senha de um cliente específico
app.put("/clientes/:id/senha", (req, res) => {
    const { id } = req.params;
    const { senha } = req.body;

    const stmt = banco.prepare("UPDATE clientes SET senha = ? WHERE id = ?");
    const result = stmt.run(senha, id);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Cliente não encontrado" });
    }

    res.status(200).json({ message: "Senha atualizada com sucesso" });
});
// ROTAS PROFISSIONAIS
// Rota para consultar os profissionais
app.get("/profissionais", (req, res) => {
    const profissionais = banco
        .prepare("SELECT id, nome, cpf, telefone, profissao FROM profissionais")
        .all();

    res.json(profissionais);
});
// Rota para cadastrar um novo profissional
app.post("/profissionais", (req, res) => {
    const { nome, cpf, telefone, profissao, senha } = req.body;

    const stmt = banco.prepare(`
        INSERT INTO profissionais (nome, cpf, telefone, profissao, senha)
        VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(nome, cpf, telefone, profissao, senha);

    res.status(201).json({
        id: result.lastInsertRowid,
        nome,
        cpf,
        telefone,
        profissao,
    });
});
// Rota para consultar um profissional específico
app.get("/profissionais/:id", (req, res) => {
    const { id } = req.params;

    const profissional = banco
        .prepare("SELECT id, nome, cpf, telefone, profissao FROM profissionais WHERE id = ?")
        .get(id);

    if (!profissional) {
        return res.status(404).json({ error: "Profissional não encontrado" });
    }

    res.json(profissional);
});
// Rota para deletar um profissional específico
app.delete("/profissionais/:id", (req, res) => {
    const { id } = req.params;

    const stmt = banco.prepare("DELETE FROM profissionais WHERE id = ?");
    const result = stmt.run(id);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Profissional não encontrado" });
    }

    res.status(200).json({ message: "Profissional deletado com sucesso" });
});
// Rota para atualizar informações de um profissional específico
app.put("/profissionais/:id", (req, res) => {
    const { id } = req.params;
    const { nome, cpf, telefone, profissao, senha } = req.body;

    const stmt = banco.prepare("UPDATE profissionais SET nome = ?, cpf = ?, telefone = ?, profissao = ?, senha = ? WHERE id = ?");
    const result = stmt.run(nome, cpf, telefone, profissao, senha, id);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Profissional não encontrado" });
    }

    res.status(200).json({ message: "Informações do profissional atualizadas com sucesso" });
});
// Rota para atualizar senha de um profissional específico
app.put("/profissionais/:id/senha", (req, res) => {
    const { id } = req.params;
    const { senha } = req.body;

    const stmt = banco.prepare("UPDATE profissionais SET senha = ? WHERE id = ?");
    const result = stmt.run(senha, id);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Profissional não encontrado" });
    }

    res.status(200).json({ message: "Senha atualizada com sucesso" });
});
// ROTAS AGENDAMENTOS
// Rota para consultar os agendamentos
app.get("/agendamentos", (req, res) => {
    const agendamentos = banco
        .prepare("SELECT * FROM agendamentos")
        .all();
    res.json(agendamentos);
});
// Rota para o cliente cadastrar um novo agendamento
app.post("/agendamentos", (req, res) => {
    const { cliente_id, profissional_id, servico, data, horario, orcamento, status } = req.body;

    const stmt = banco.prepare("INSERT INTO agendamentos (cliente_id, profissional_id, servico, data, horario, orcamento, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
    const result = stmt.run(cliente_id, profissional_id, servico, data, horario, orcamento, status);

    res.status(201).json({
        id: result.lastInsertRowid,
        cliente_id,
        profissional_id,
        servico,
        data,
        horario,
        orcamento,
        status
    });
});
// Rota para consultar um agendamento específico
app.get("/agendamentos/:id", (req, res) => {
    const { id } = req.params;

    const agendamento = banco
        .prepare("SELECT * FROM agendamentos WHERE id = ?")
        .get(id);

    if (!agendamento) {
        return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    res.json(agendamento);
});
// Rota para deletar um agendamento específico
app.delete("/agendamentos/:id", (req, res) => {
    const { id } = req.params;

    const stmt = banco.prepare("DELETE FROM agendamentos WHERE id = ?");
    const result = stmt.run(id);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    res.status(200).json({ message: "Agendamento deletado com sucesso" });
});
// Rota para atualizar informações de um agendamento específico
app.put("/agendamentos/:id", (req, res) => {
    const { id } = req.params;
    const { cliente_id, profissional_id, servico, data, horario, orcamento, status } = req.body;

    const stmt = banco.prepare("UPDATE agendamentos SET cliente_id = ?, profissional_id = ?, servico = ?, data = ?, horario = ?, orcamento = ?, status = ? WHERE id = ?");
    const result = stmt.run(cliente_id, profissional_id, servico, data, horario, orcamento, status, id);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    res.status(200).json({ message: "Agendamento atualizado com sucesso" });
});
// Rota para consultar a disponibilidade
app.get("/disponibilidade", (req, res) => {
    const disponibilidade = banco
        .prepare("SELECT * FROM disponibilidade")
        .all();
    res.json(disponibilidade);
});
// Rota para o profissional cadastrar uma nova disponibilidade
app.post("/disponibilidade", (req, res) => {
    const { profissional_id, data, horario, orcamento } = req.body;

    const stmt = banco.prepare("INSERT INTO disponibilidade (profissional_id, data, horario, orcamento) VALUES (?, ?, ?, ?)");
    const result = stmt.run(profissional_id, data, horario, orcamento);

    res.status(201).json({
        id: result.lastInsertRowid,
        profissional_id,
        data,
        horario,
        orcamento
    });
});
// Rota para consultar a disponibilidade de um profissional específico
app.get("/disponibilidade/:profissional_id", (req, res) => {
    const { profissional_id } = req.params;

    const disponibilidade = banco
        .prepare("SELECT * FROM disponibilidade WHERE profissional_id = ?")
        .all(profissional_id);

    res.json(disponibilidade);
});
// Rota para consultar avaliações
app.get("/avaliacoes", (req, res) => {
    const avaliacoes = banco
        .prepare("SELECT * FROM avaliacoes")
        .all();
    res.json(avaliacoes);
});
// Rota para o cliente cadastrar uma nova avaliação
app.post("/avaliacoes", (req, res) => {
    const { cliente_id, profissional_id, agendamento_id, avaliacao } = req.body;

    const stmt = banco.prepare("INSERT INTO avaliacoes (cliente_id, profissional_id, agendamento_id, avaliacao) VALUES (?, ?, ?, ?)");
    const result = stmt.run(cliente_id, profissional_id, agendamento_id, avaliacao);

    res.status(201).json({
        id: result.lastInsertRowid,
        cliente_id,
        profissional_id,
        agendamento_id,
        avaliacao
    });
});
// Rota para consultar avaliações de um profissional específico
app.get("/avaliacoes/:profissional_id", (req, res) => {
    const { profissional_id } = req.params;

    const avaliacoes = banco
        .prepare("SELECT * FROM avaliacoes WHERE profissional_id = ?")
        .all(profissional_id);

    res.json(avaliacoes);
});
// Inicia o servidor
app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});