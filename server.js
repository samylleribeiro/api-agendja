// Pega o Express instalado no projeto
const express = require("express");
// Pega o CORS instalado no projeto
const cors = require("cors");
// Pega o Better SQLite3 instalado no projeto
const Database = require("better-sqlite3");
// pega o bcrypt (hash)instalado para hash na senha
const bcrypt = require("bcrypt");
// pega o crypto (hash) instalado para hash no cpf
const crypto = require("crypto");
// Cria uma instância(aplicativo) do Express
const app = express();
// Permite que o frontend faça requisições para a API
app.use(cors());
// permite que o Express entenda requisições com corpo em JSON
app.use(express.json());
// Conecta ao banco de dados
const banco = new Database("agendja.db");
// Rota inicial da API
app.get("/", (req, res) => {
    res.send("Bem-vindo(a) à API do AgendJa! Acesse /clientes, /profissionais, /agendamentos, /disponibilidade ou /avaliacoes para interagir com a API.");
});
// ROTAS CLIENTES
// Rota para consultar os clientes
app.get("/clientes", (req, res) => {
    const clientes = banco
        .prepare("SELECT id, nome, telefone FROM clientes")
        .all();
    res.json(clientes);
});
// Rota para cadastrar um novo cliente
app.post("/clientes",async (req, res) => {
    const { nome, cpf, telefone, senha } = req.body;
    // validações dos campos vazios
    if (validarCamposVazios(nome) || validarCamposVazios(cpf) || validarCamposVazios(telefone) || validarCamposVazios(senha)) {
        return res.status(400).json({ error: "Preencha todos os campos" });
    }
    // validação do CPF
    if (!validarCPF(cpf)) {
        return res.status(400).json({ error: "CPF inválido" });
    }
    // validação do telefone
    if (!validarTelefone(telefone)) {
        return res.status(400).json({ error: "Telefone inválido" });
    }
    // validação da senha
    if (!validarSenha(senha)) {
        return res.status(400).json({ error: "Senha inválida. A senha deve ter no mínimo 6 caracteres." });
    }
    // validação do nome
    if (!validarNome(nome)) {
        return res.status(400).json({ error: "Nome inválido. O nome deve conter apenas letras e espaços." });
    }
    // prepara o banco de dados para inserir um novo cliente
    const stmt = banco.prepare(`
        INSERT INTO clientes (nome, cpf, telefone, senha)
        VALUES (?, ?, ?, ?)
    `);
    // Gera o hash da senha antes de armazená-la no banco de dados
    const senhaHash = await bcrypt.hash(senha, 10);
    // Gera o hash do CPF antes de armazená-lo no banco de dados
   const cpfNormalizado = cpf.replace(/\D/g, "");
   const cpfHash = gerarHashCPF(cpfNormalizado);
   // Executa a inserção no banco de dados
   let result;
// Tenta salvar os dados e verificar se o CPF já está cadastrado
try {
    result = stmt.run(nome, cpfHash, telefone, senhaHash);
} catch (erro) {
    if (erro.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return res.status(400).json({ error: "CPF já cadastrado" });
    }

    throw erro;
}

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
        .prepare("SELECT id, nome, telefone FROM clientes WHERE id = ?")
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
    const { nome, cpf, telefone } = req.body;
    // validações dos campos vazios
    if (validarCamposVazios(nome) || validarCamposVazios(cpf) || validarCamposVazios(telefone)) {
        return res.status(400).json({ error: "Preencha todos os campos" });
    }
    // validação do CPF
    if (!validarCPF(cpf)) {
        return res.status(400).json({ error: "CPF inválido" });
    }
    // validação do nome
    if (!validarNome(nome)) {
        return res.status(400).json({ error: "Nome inválido. O nome deve conter apenas letras e espaços." });
    }
    // validação do telefone
    if (!validarTelefone(telefone)) {
        return res.status(400).json({ error: "Telefone inválido" });
    }
    // Gera o hash do CPF antes de armazená-lo no banco de dados
    const cpfNormalizado = cpf.replace(/\D/g, "");
    const cpfHash = gerarHashCPF(cpfNormalizado);
   // tenta atualizar os dados do cliente no banco de dados e verificar se o cpf já está cadastrado para outro cliente
   let result;
   try {
         const stmt = banco.prepare("UPDATE clientes SET nome = ?, cpf = ?, telefone = ? WHERE id = ?");
        result = stmt.run(nome, cpfHash, telefone, id);
    } catch (erro) {
        if (erro.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(400).json({ error: "CPF já cadastrado para outro cliente" });
        }
        throw erro;
    }
    // verifica se o cliente foi encontrado
    if (result.changes === 0) {
        return res.status(404).json({ error: "Cliente não encontrado" });
    }
    res.status(200).json({ message: "Informações do cliente atualizadas com sucesso" });
});
// Rota para atualizar senha de um cliente específico
app.put("/clientes/:id/senha",  async (req, res) => {
    const { id } = req.params;
    const { senha } = req.body;
    // validação dos campos vazios
    if (validarCamposVazios(senha)) {
        return res.status(400).json({ error: "Preencha todos os campos" });
    }
    // validação da senha
    if (!validarSenha(senha)) {
        return res.status(400).json({ error: "Senha inválida. A senha deve ter no mínimo 6 caracteres." });
    }
    // Gera o hash da nova senha
    const senhaHash = await bcrypt.hash(senha, 10);
    // Atualiza a senha do cliente no banco de dados
    const stmt = banco.prepare("UPDATE clientes SET senha = ? WHERE id = ?");
    const result = stmt.run(senhaHash, id);
    // verifica se o cliente foi encontrado
    if (result.changes === 0) {
        return res.status(404).json({ error: "Cliente não encontrado" });
    }
    // retorna mensagem de sucesso
    res.status(200).json({ message: "Senha atualizada com sucesso" });
});
// Rota para autenticação de um cliente específico
app.post("/clientes/login", async  (req, res) => {
    const { cpf, senha } = req.body;
    // validação de campos vazios
    if (validarCamposVazios(cpf) || validarCamposVazios(senha)) {
        return res.status(400).json({ error: "Preencha todos os campos" });
    }
    // validação do CPF
    if (!validarCPF(cpf)) {
        return res.status(400).json({ error: "CPF inválido" });
    }
    // validação da senha
    if (!validarSenha(senha)) {
        return res.status(400).json({ error: "Senha inválida. A senha deve ter no mínimo 6 caracteres." });
    }
   // Gera o hash do CPF para buscar no banco de dados
    const cpfHash = gerarHashCPF(cpf);
    // Busca o cliente no banco de dados pelo CPF
   const cliente = banco
    .prepare("SELECT id, nome, telefone, senha FROM clientes WHERE cpf = ?")
    .get(cpfHash);
    // Verifica se o cliente existe e se a senha está correta
if (!cliente || !(await bcrypt.compare(senha, cliente.senha))) {
    return res.status(401).json({ error: "Credenciais inválidas" });
}
const { senha: _, ...dadosCliente } = cliente;
res.json(dadosCliente);
});
// ROTAS PROFISSIONAIS
// Rota para consultar os profissionais
app.get("/profissionais", (req, res) => {
    const profissionais = banco
        .prepare("SELECT id, nome, telefone, profissao FROM profissionais")
        .all();

    res.json(profissionais);
});
// Rota para cadastrar um novo profissional
app.post("/profissionais", async (req, res) => {
    const { nome, cpf, telefone, profissao, senha } = req.body;
    // VALIDAÇÕES
    // validação dos campos vazios
    if (validarCamposVazios(nome) || validarCamposVazios(cpf) || validarCamposVazios(telefone) || validarCamposVazios(profissao) || validarCamposVazios(senha)) {
        return res.status(400).json({ error: "Preencha todos os campos" });
    }
    // validação do CPF
    if (!validarCPF(cpf)) {
        return res.status(400).json({ error: "CPF inválido" });
    }
    // validação do telefone
    if (!validarTelefone(telefone)) {
        return res.status(400).json({ error: "Telefone inválido" });
    }
    // validação da senha
    if (!validarSenha(senha)) {
        return res.status(400).json({ error: "Senha inválida. A senha deve ter no mínimo 6 caracteres." });
    }
    // validação do nome
    if (!validarNome(nome)) {
        return res.status(400).json({ error: "Nome inválido. O nome deve conter apenas letras e espaços." });
    }
    // prepara o banco de dados para inserir um novo profissional  
    const stmt = banco.prepare(`
        INSERT INTO profissionais (nome, cpf, telefone, profissao, senha)
        VALUES (?, ?, ?, ?, ?)
    `);
    // Gera o hash do CPF antes de armazená-lo no banco de dados
    const cpfNormalizado = cpf.replace(/\D/g, "");
    const cpfHash = gerarHashCPF(cpfNormalizado);
    // Gera o hash da senha antes de armazená-la no banco de dados
    const senhaHash = await bcrypt.hash(senha, 10);
    // tenta salvar os dados e verificar se o CPF já está cadastrado
    let result;
    try {
        result = stmt.run(nome, cpfHash, telefone, profissao, senhaHash);
    }
    catch (erro) {
        if (erro.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(400).json({ error: "CPF já cadastrado" });
        }
        throw erro;
    }

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
        .prepare("SELECT id, nome, telefone, profissao FROM profissionais WHERE id = ?")
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
    const { nome, cpf, telefone, profissao } = req.body;
    // VALIDAÇÕES
    // validação dos campos vazios
    if (validarCamposVazios(nome) || validarCamposVazios(cpf) || validarCamposVazios(telefone) || validarCamposVazios(profissao)) {
        return res.status(400).json({ error: "Preencha todos os campos" });
    }
    // validação do CPF
    if (!validarCPF(cpf)) {
        return res.status(400).json({ error: "CPF inválido" });
    }
    // validação do telefone
    if (!validarTelefone(telefone)) {
        return res.status(400).json({ error: "Telefone inválido" });
    }
    // validação do nome
    if (!validarNome(nome)) {
        return res.status(400).json({ error: "Nome inválido. O nome deve conter apenas letras e espaços." });
    }
    // Gera o hash do CPF antes de armazená-lo no banco de dados
    const cpfNormalizado = cpf.replace(/\D/g, "");
    const cpfHash = gerarHashCPF(cpfNormalizado);
    // tenta atualizar os dados do profissional no banco de dados e verificar se o cpf já está cadastrado para outro profissional
    let result;
    try {
        const stmt = banco.prepare("UPDATE profissionais SET nome = ?, cpf = ?, telefone = ?, profissao = ? WHERE id = ?");
        result = stmt.run(nome, cpfHash, telefone, profissao, id);
    } catch (erro) {
        if (erro.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(400).json({ error: "CPF já cadastrado para outro profissional" });
        }
        throw erro;
    }
    // verifica se o profissional foi encontrado
    if (result.changes === 0) {
        return res.status(404).json({ error: "Profissional não encontrado" });
    }
   // retorna mensagem de sucesso
    res.status(200).json({ message: "Informações do profissional atualizadas com sucesso" });
});
// Rota para atualizar senha de um profissional específico
app.put("/profissionais/:id/senha", async (req, res) => {
    const { id } = req.params;
    const { senha } = req.body;
    // validação dos campos vazios
    if (validarCamposVazios(senha)) {
        return res.status(400).json({ error: "Preencha todos os campos" });
    }
    // validação da senha
    if (!validarSenha(senha)) {
        return res.status(400).json({ error: "Senha inválida. A senha deve ter no mínimo 6 caracteres." });
    }
    // Gera o hash da nova senha
    const senhaHash = await bcrypt.hash(senha, 10);
    // Atualiza a senha do profissional no banco de dados
    const stmt = banco.prepare("UPDATE profissionais SET senha = ? WHERE id = ?");
    const result = stmt.run(senhaHash, id);
    // verifica se o profissional foi encontrado
    if (result.changes === 0) {
        return res.status(404).json({ error: "Profissional não encontrado" });
    }
    // retorna mensagem de sucesso
    res.status(200).json({ message: "Senha atualizada com sucesso" });
});
// Rota para autenticação de um profissional específico
app.post("/profissionais/login", async (req, res) => {
    const { cpf, senha } = req.body;
    // validação de campos vazios
    if (validarCamposVazios(cpf) || validarCamposVazios(senha)) {
        return res.status(400).json({ error: "Preencha todos os campos" });
    }
    // validação do CPF
    if (!validarCPF(cpf)) {
        return res.status(400).json({ error: "CPF inválido" });
    }
    // validação da senha
    if (!validarSenha(senha)) {
        return res.status(400).json({ error: "Senha inválida. A senha deve ter no mínimo 6 caracteres." });
    }
    // Gera o hash do CPF para buscar no banco de dados
    const cpfHash = gerarHashCPF(cpf);
    // Busca o profissional no banco de dados pelo CPF
    const profissional = banco
    .prepare("SELECT id, nome, telefone, profissao, senha FROM profissionais WHERE cpf = ?")
    .get(cpfHash);
    // Verifica se o profissional existe e se a senha está correta
    if (!profissional || !(await bcrypt.compare(senha, profissional.senha))) {
        return res.status(401).json({ error: "Credenciais inválidas" });
    }
    const { senha: _, ...dadosProfissional } = profissional;
    res.json(dadosProfissional);
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
    // validações dos campos vazios
    if (validarCamposVazios(cliente_id) || validarCamposVazios(profissional_id) || validarCamposVazios(servico) || validarCamposVazios(data) || validarCamposVazios(horario) || validarCamposVazios(orcamento) || validarCamposVazios(status)) {
        return res.status(400).json({ error: "Preencha todos os campos" });
    }
    // prepara o banco de dados para inserir um novo agendamento
    const stmt = banco.prepare("INSERT INTO agendamentos (cliente_id, profissional_id, servico, data, horario, orcamento, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
    // executa a inserção no banco de dados
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
// Rota para consultar agendamentos de um cliente específico
app.get("/agendamentos/cliente/:cliente_id", (req, res) => {
    const { cliente_id } = req.params;

    const agendamentos = banco
        .prepare("SELECT * FROM agendamentos WHERE cliente_id = ?")
        .all(cliente_id);

    res.json(agendamentos);
});
// Rota para consultar agendamentos de um profissional específico
app.get("/agendamentos/profissional/:profissional_id", (req, res) => {
    const { profissional_id } = req.params;

    const agendamentos = banco
        .prepare("SELECT * FROM agendamentos WHERE profissional_id = ?")
        .all(profissional_id);

    res.json(agendamentos);
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
    // validações dos campos vazios
    if (validarCamposVazios(cliente_id) || validarCamposVazios(profissional_id) || validarCamposVazios(servico) || validarCamposVazios(data) || validarCamposVazios(horario) || validarCamposVazios(orcamento) || validarCamposVazios(status)) {
        return res.status(400).json({ error: "Preencha todos os campos" });
    }
    // prepara o banco de dados para atualizar um agendamento específico
    const stmt = banco.prepare("UPDATE agendamentos SET cliente_id = ?, profissional_id = ?, servico = ?, data = ?, horario = ?, orcamento = ?, status = ? WHERE id = ?");
    // executa a atualização no banco de dados
    const result = stmt.run(cliente_id, profissional_id, servico, data, horario, orcamento, status, id);
    // verifica se o agendamento foi encontrado
    if (result.changes === 0) {
        return res.status(404).json({ error: "Agendamento não encontrado" });
    }
    // retorna mensagem de sucesso
    res.status(200).json({ message: "Agendamento atualizado com sucesso" });
});
// ROTAS DISPONIBILIDADE
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
    // VALIDAÇÕES
    // validação dos campos vazios
    if (validarCamposVazios(data) || validarCamposVazios(horario) || validarCamposVazios(orcamento)) {
        return res.status(400).json({ error: "Preencha todos os campos" });
    }
    // validação do profissional_id
    if (!validarProfissionalID(profissional_id)) {
        return res.status(400).json({error: "Profissional não encontrado pelo id inserido"})
    }
    // prepara o banco de dados para inserir uma nova disponibilidade
    const stmt = banco.prepare("INSERT INTO disponibilidade (profissional_id, data, horario, orcamento) VALUES (?, ?, ?, ?)");
    // executa a inserção no banco de dados
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
// ROTAS AVALIACOES
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
// Rota para redefinir senha de um cliente ou profisional, caso tenha esquecido a senha
app.post("/redefinir-senha", async (req, res) => {
    const { nome,tipo, cpf, novaSenha } = req.body;
    // validação de campos vazios
    if (validarCamposVazios(nome) || validarCamposVazios(tipo) || validarCamposVazios(cpf) || validarCamposVazios(novaSenha)) {
        return res.status(400).json({ error: "Preencha todos os campos" });
    }
    // validação do CPF
    if (!validarCPF(cpf)) {
        return res.status(400).json({ error: "CPF inválido" });
    }
    // validação da senha
    if (!validarSenha(novaSenha)) {
        return res.status(400).json({ error: "Senha inválida. A senha deve ter no mínimo 6 caracteres." });
    }
    // validação do nome
    if (!validarNome(nome)) {
        return res.status(400).json({ error: "Nome inválido. O nome deve conter apenas letras e espaços." });
    }
  try {
    // Verifica se o usuário é cliente ou profissional
    // se não for nenhum dos dois, retorna erro
    if (tipo !== "cliente" && tipo !== "profissional") {
      return res.status(400).json({ error: "Tipo de usuário inválido" });
    }
   // escolhe a tabela correta com base no tipo de usuário
    const tabela = tipo === "cliente" ? "clientes" : "profissionais";
    // Gera o hash do CPF para buscar no banco de dados
    const cpfNormalizado = cpf.replace(/\D/g, "");
    const cpfHash = gerarHashCPF(cpfNormalizado);
    // Verifica se o usuário existe no banco de dados
    const usuario = banco.prepare(`SELECT * FROM ${tabela} WHERE nome = ? AND cpf = ?`).get(nome, cpfHash);
    // se não existir, retorna erro
    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    // Gera o hash da nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    // Atualiza a senha do usuário no banco de dados
    banco.prepare(`UPDATE ${tabela} SET senha = ? WHERE id = ?`).run(novaSenhaHash, usuario.id);
    // retorna mensagem de sucesso
    res.json({ message: "Senha redefinida com sucesso" });
  }
  catch (error) {
    console.error("Erro ao redefinir senha:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});
// função simples para garar hash na cpf, sempre o mesmo cpf vai gerar o mesmo hash, para não exibir no banco de dados
function gerarHashCPF(cpf) {
    return crypto.createHash("sha256").update(cpf).digest("hex");
}
// VALIDAÇÕES
// função para validar o CPF
function validarCPF(cpf) {
    // verifica se o CPF é uma string
    if (typeof cpf !== "string") {
        return false;
    }
    // verifica se o CPF tem 11 caracteres
    if (cpf.length !== 11) {
        return false;
    }
    // verifica se todos os caracteres são números
    if (!/^\d+$/.test(cpf)) {
        return false;
    }
    // verifica se todos os dígitos são iguais (ex: 11111111111)
    if (/^(\d)\1+$/.test(cpf)) {
        return false;
    }
   // calcula os dígitos verificadores do CPF
   if (!calcularDigitosVerificadores(cpf)) {
       return false;
   }
   return true;
}
// função para calcular os dígitos verificadores do CPF
function calcularDigitosVerificadores(cpf) {
    let soma = 0;
    let resto;

    // calcula o primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.charAt(i - 1)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 ) {
        resto = 0;
    }
    if (resto !== parseInt(cpf.charAt(9))) {
        return false;
    }

    // calcula o segundo dígito verificador
    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.charAt(i - 1)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 ) {
        resto = 0;
    }
    if (resto !== parseInt(cpf.charAt(10))) {
        return false;
    }

    return true;
}
// função para validar campos vazios
function validarCamposVazios(campo) {
// verifica se o campo está vazio
    if (typeof campo !== "string" || campo.trim() === "") {
        return true; // campo vazio
    }
    return false; // campo preenchido
}
// função para validar o nome do usuário (apenas letras e espaços)
function validarNome(nome) {
// verifica se o nome contém apenas letras e espaços
    if (typeof nome !== "string" || !/^[A-Za-zÀ-ÿ\s]+$/.test(nome)) {
        return false; // nome inválido
    }
   return true; // nome válido
}
// função para validar o telefone do profissional
function validarTelefone(telefone) {
    // verifica se recebeu uma string
    if (typeof telefone !== "string") {
        return false;
    }
    // remove tudo o que não for número
    let apenasNumeros = telefone.replace(/\D/g, "");
    // verifica se tem 10 ou 11 dígitos
    if (apenasNumeros.length !== 10 && apenasNumeros.length !== 11) {
        return false;
    }
    return true;
}
// função para validar a senha do usuário (mínimo 6 caracteres)
function validarSenha(senha) {
    if (typeof senha !== "string" || senha.length < 6) {
        return false;
    }
    return true;
}
// função para validar o profissional pelo id
function validarProfissionalID(id) {
// valida se o id é um número inteiro e positivo
if(!Number.isInteger(Number(id)) || Number(id) <= 0) {
    return false;
}
// valida se o id inserido esta cadastrado para algum profissional no banco de dados
  const profissional = banco
        .prepare("SELECT id FROM profissionais WHERE id = ?")
        .get(Number(id));
// retorna o profissional
// !! -> booleano(falso ou positivo)      
 return !! profissional;   
}
// Inicia o servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});