const Database = require("better-sqlite3");

// Cria ou abre o banco de dados
const banco = new Database("agendja.db");
// Cria a tabela de clientes, caso ela não exista
banco.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    telefone TEXT,
    senha TEXT NOT NULL
  )
`);
//Criar a tabela de profissionais, caso ela não exista
banco.exec(`
  CREATE TABLE IF NOT EXISTS profissionais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    telefone TEXT,
    profissao TEXT NOT NULL,
    senha TEXT NOT NULL
  )
`);
//Criar a tabela de agendamentos, caso ela não exista
banco.exec(`
  CREATE TABLE IF NOT EXISTS agendamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    profissional_id INTEGER NOT NULL,
    servico TEXT NOT NULL,
    data TEXT NOT NULL,
    horario TEXT NOT NULL,
    orcamento TEXT NOT NULL,
    status TEXT NOT NULL
  )
`);
// Criar a tabela disponibilidade/orçamentos, caso ela não exista
banco.exec(`
  CREATE TABLE IF NOT EXISTS disponibilidade (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profissional_id INTEGER NOT NULL,
    data TEXT NOT NULL,
    horario TEXT NOT NULL,
    orcamento TEXT NOT NULL
  )
`);
// Criar a tabela avaliação, caso ela ainda não exista
banco.exec(`
  CREATE TABLE IF NOT EXISTS avaliacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    profissional_id INTEGER NOT NULL,
    agendamento_id INTEGER NOT NULL,
    avaliacao TEXT NOT NULL
  )
`);
console.log("Banco de dados conectado com sucesso!");