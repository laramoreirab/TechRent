// =============================================
// CONTROLLER DE AUTENTICAÇÃO
// =============================================
// TODO (alunos): implementar as funções registro e login.
//
// Dicas:
//   - Use bcryptjs para criptografar a senha antes de salvar (registro)
//   - Use bcryptjs para comparar a senha no login (bcrypt.compare)
//   - Use jsonwebtoken (jwt.sign) para gerar o token após login bem-sucedido
//   - O payload do token deve ter: id, nome, email, nivel_acesso
//   - NUNCA coloque a senha no payload do token!

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { read, create, hashPassword, comparePassword } = require('../config/database')

// POST /auth/registro - cria um novo usuário
const registro = async (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  try{
  if(!email || email.trim() == ''){
    return res.status(400).json({
      sucesso: false,
      erro: 'Email obrigatório',
      mensagem: 'Email é obrigatório'
    })
  }
  if(!nome || nome.trim() == ''){
      return res.status(400).json({
        sucesso: false,
        erro: 'Nome obrigatório',
        mensagem: 'Nome é obrigatório'
      })
  } 
  if(nome.length < 2){
    return res.status(400).json({
      sucesso: false,
      erro: 'Nome curto',
      mensagem: 'Insira um nome válido!'
    })
  }
  if(!senha || senha.trim() == ''){
    return res.status(400).json({
      sucesso: false,
      erro: 'Senha é obrigatório',
      mensagem: 'A senha é obrigatório'
    })
  }

  if(senha.length < 8){
    return res.status(400).json({
      sucesso: false,
      erro: 'Senha curta',
      mensagem: 'A senha deve ter no mínimo 8 caracteres'
    })
  }

  const emailRegexe =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!emailRegexe.test(email)){
    return res.status(400).json({
      sucesso: false,
      erro: 'Email inválido',
      mensagem: 'Formato de email errado'
    })
  }

  const buscarUsuario = await read('usuarios', email)
  if(buscarUsuario){
    return res.status(400).json({
      sucesso: false,
      erro: "Usuário já cadastrado",
      mensagem: "Usuário já cadastrado!"
    })
  }

  const senhaHash = await hashPassword(senha);
  if(!senhaHash){
    return res.status(400).json({
      sucesso: false,
      erro:"Não é possível gerar hash da senha",
      mensagem: "Não é possível gerar hash da senha cadastrada"
    })
  }

  const dadosUsuario = {
    nome: nome,
    email: email,
    senha: senhaHash,
    nivel_acesso: tipo || 'cliente'
  }

  const usuarioId = await create('usuarios', dadosUsuario)

  if(!usuarioId){
    return res.status(400).json({
      sucesso: false,
      erro: "Não foi possível registrar novo usuário",
      mensagem: "Não foi possível registrar novo usuário"
    })
  }
  res.status(201).json({
    sucesso: true,
    mensagem: 'Usuário cadastro com sucesso!',
    dados: {
      id: usuarioId,
      nome: nome,
      email: email,
      nivel_acesso: tipo
    }
  })
}catch(error){
  res.status(400).json({ 
  sucesso: false,
  erro: 'Erro interno no servidor',
  mensagem: 'Erro ao criar novo usuário' });}
};


// POST /auth/login - autentica e retorna JWT
const login = async (req, res) => {
  const { email , senha } = req.header

   if(!email || email.trim() == ''){
    return res.status(400).json({
      sucesso: false,
      erro: 'Email obrigatório',
      mensagem: 'Email é obrigatório'
    })}

    if(!senha || senha.trim() == ''){
    return res.status(400).json({
      sucesso: false,
      erro: 'Senha é obrigatório',
      mensagem: 'A senha é obrigatório'
    })
  }

  if(senha.length < 8){
    return res.status(400).json({
      sucesso: false,
      erro: 'Senha curta',
      mensagem: 'A senha deve ter no mínimo 8 caracteres'
    })
  }

  const emailRegexe =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!emailRegexe.test(email)){
    return res.status(400).json({
      sucesso: false,
      erro: 'Email inválido',
      mensagem: 'Formato de email errado'
    })
  }

  //verificar credenciais 
  //buscar email e ver se existe um usuário com o email cadastrado
  const rowUsuario = await read('usuarios', `email = '${email}'`);
  const senhaValida = await comparePassword(senha, rowUsuario.senha);

  if(!rowUsuario || !senhaValida){
    return res.status.json({
      sucesso: false,
      erro: 'Usuário não encontrado, email ou senha inváidos!',
      mensagem: 'Usuário não encontrado, email ou senha inválidos!'
    })
  }

  
  }

module.exports = { registro, login };
