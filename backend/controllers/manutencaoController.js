// =============================================
// CONTROLLER DE HISTÓRICO DE MANUTENÇÃO
// =============================================
// TODO (alunos): implementar cada função abaixo.

const db = require('../config/database');

// GET /manutencao - lista todos os registros de manutenção (admin/técnico)
const listar = async (req, res) => {
  // TODO
  res.json({ mensagem: 'listar manutenções - não implementado' });
};

// POST /manutencao - registra um reparo em um equipamento (técnico)
// Body esperado: { chamado_id, equipamento_id, descricao }
// Após registrar, atualizar chamados.status para 'resolvido'
// e equipamentos.status para 'operacional'
const registrar = async (req, res) => {
  // TODO
  res.json({ mensagem: 'registrar manutenção - não implementado' });
};

module.exports = { listar, registrar };
