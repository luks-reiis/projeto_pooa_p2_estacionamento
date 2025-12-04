const express = require('express');
const router = express.Router();
const pool = require('../db');

// Estacionar (entrada)
router.post('/entrada', async (req, res) => {
  const { veiculoId } = req.body;

  if (!veiculoId) {
    return res.status(400).json({ message: 'veiculoId é obrigatório' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Buscar vaga livre
    const [vagasLivres] = await connection.query(
      'SELECT id, numero FROM vaga WHERE ocupada = 0 ORDER BY numero LIMIT 1'
    );

    if (!vagasLivres.length) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: 'Sem vagas disponíveis' });
    }

    const vaga = vagasLivres[0];

    // Criar movimentação
    const [movResult] = await connection.query(
      'INSERT INTO movimentacao (veiculo_id, vaga_id, hora_entrada, ativo) VALUES (?, ?, NOW(), 1)',
      [veiculoId, vaga.id]
    );

    // Marcar vaga como ocupada
    await connection.query('UPDATE vaga SET ocupada = 1 WHERE id = ?', [vaga.id]);

    await connection.commit();
    connection.release();

    res.status(201).json({
      message: 'Veículo estacionado com sucesso',
      movimentacaoId: movResult.insertId,
      vaga,
    });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error(err);
    res.status(500).json({ message: 'Erro ao estacionar veículo' });
  }
});

// Saída do veículo
router.post('/saida', async (req, res) => {
  const { movimentacaoId, valor } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Buscar movimentação ativa
    const [movs] = await connection.query(
      'SELECT * FROM movimentacao WHERE id = ? AND ativo = 1',
      [movimentacaoId]
    );

    if (!movs.length) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: 'Movimentação não encontrada ou já encerrada' });
    }

    const mov = movs[0];

    // Atualizar movimentação
    await connection.query(
      'UPDATE movimentacao SET hora_saida = NOW(), valor = ?, ativo = 0 WHERE id = ?',
      [valor || 0, movimentacaoId]
    );

    // Liberar vaga
    await connection.query('UPDATE vaga SET ocupada = 0 WHERE id = ?', [mov.vaga_id]);

    await connection.commit();
    connection.release();

    res.json({ message: 'Saída registrada com sucesso' });
  } catch (err) {
    await connection.rollback();
    connection.release();
    res.status(500).json({ message: 'Erro ao registrar saída' });
  }
});

module.exports = router;
