// =============================================
// CONFIGURAÇÃO DA CONEXÃO COM O BANCO DE DADOS
// =============================================
// O mysql2 é usado por ter suporte a Promises (async/await),
// o que facilita muito o código assíncrono no Node.js.

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs')

dotenv.config()
// Cria um "pool" de conexões.
// Um pool reutiliza conexões abertas ao invés de abrir uma nova a cada query,
// o que é mais eficiente e evita sobrecarregar o banco.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Número máximo de conexões simultâneas no pool
  connectionLimit: 10,
  // Retorna valores numéricos como números JS (não como strings)
  typeCast: true,
});

async function getConnection(){  // função que cria conexão com o banco de dados 
  return pool.getConnection()
};

async function read(table, where=null){
  const connection = await getConnection(); //cria conexão com o pool 
  try {
    const sql = `SELECT * FROM ${table}`
    if(where){
      sql += `where = ${where}` //se o where não for nulo adiciona o where enviado
    }
    const [rows] = await connection.execute(sql) //executa o comando sql + o parametro que substitui o '?' no "email = ?", [email] por exemplo
    return rows
  } finally{
    connection.release() //finaliza a conexão com o banco
  }
};

//insere um novo registro
async function create(table, data) {
  const connection = await getConnection()
  try{
    const columns = Object.keys(data).join(', ') // separa as colunas do registro ex : (nome, rep, cnpj) que estão separadas por vírgula
    const placeholders = Array(Object.keys(data).length).fill('?').join(', ') // aqui criamos uma array com interrogações para identificar a quantidade de valores que serão adicionados ex: ('?', '?', '?', '?')
    const sql = `INSERT INTO ${table} (${columns}) VALUES ${placeholders}` // inserimos as informações ex: (insert into empresas (nome, rep, cnpj) values (?, ?, ?, ?))
    const values = Object.values(data) //pega os valores das chaves 
    const [result] = await connection.execute(sql, values) //executa insert com os valores 
    return result.inserId
  }finally{
    connection.release()
  }
}

async function update(table, data, where) {
  const connection = await getConnection()
  try{
    const set = Object.keys(data).map(column => `${column} => ?`).join(', ') //pega cada coluna ex: (nome, email, idade) e coloca o valor '?' em cada coluna.
    const sql = `UPDATE ${table} SET ${set} WHERE ${where}` // UPDATE usuario SET nome = ?, email = ? WHERE id = 1
    const values = Object.values(data)
    const [result] = await connection.execute(sql, values)
    return result.affectRows
  }finally{
    connection.release()
  }
}

//função para deletar
async function deleteRecord(table, where) {
  const connection = await getConnection()
  try{
    const sql = `DELETE FROM ${table} WHERE ${where}`
    const [result] = await connection.execute(sql)
    return result.affectRows
  }finally{
    connection.release()
  }
  
}

//gere hash para a senha 
async function hashPassword(password) {
  try{
    return bcrypt.hash(password, 10)
  }catch(err){
    console.error("Erro ao gerar hash da senha", err)
    throw err
  }
}

//compara a senha com o hash
async function comparePassword(password, hash) {
  try{
    return bcrypt.compare(password, hash)
  }catch(err){
    console.log("Erro ao comparar a senha com o hash", err)
    throw err
  }
}

module.exports = { read, getConnection, create, update, deleteRecord, hashPassword, comparePassword};
