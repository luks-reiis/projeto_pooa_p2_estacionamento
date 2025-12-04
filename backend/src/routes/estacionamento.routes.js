const express = require('express');
const router = express.Router();
const pool = require('../db');

// Entrada: estacionar na primeira vaga livre (mantive para compatibilidade)
router.post('/entrada', async (req, res) => {
  const { veiculoId } = req.body;
  if (!veiculoId) return res.status(400).json({ message: 'veiculoId obrigatório' });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [vagasLivres] = await connection.query(
      'SELECT id, numero FROM vaga WHERE ocupada = 0 ORDER BY numero LIMIT 1'
    );

    if (!vagasLivres.length) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: 'Sem vagas disponíveis' });
    }

    const vaga = vagasLivres[0];

    const [movResult] = await connection.query(
      'INSERT INTO movimentacao (veiculo_id, vaga_id, hora_entrada, ativo) VALUES (?, ?, NOW(), 1)',
      [veiculoId, vaga.id]
    );

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

// Entrada em vaga específica (novo endpoint que você pediu)
router.post('/entrada-vaga', async (req, res) => {
  const { veiculoId, vagaId } = req.body;
  if (!veiculoId || !vagaId) return res.status(400).json({ message: 'veiculoId e vagaId são obrigatórios' });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [vagas] = await connection.query('SELECT * FROM vaga WHERE id = ? FOR UPDATE', [vagaId]);
    if (!vagas.length) {
      await connection.rollback(); connection.release();
      return res.status(404).json({ message: 'Vaga não encontrada' });
    }
    const vaga = vagas[0];
    if (vaga.ocupada) {
      await connection.rollback(); connection.release();
      return res.status(400).json({ message: 'Vaga já ocupada' });
    }

    const [movResult] = await connection.query(
      'INSERT INTO movimentacao (veiculo_id, vaga_id, hora_entrada, ativo) VALUES (?, ?, NOW(), 1)',
      [veiculoId, vagaId]
    );

    await connection.query('UPDATE vaga SET ocupada = 1 WHERE id = ?', [vagaId]);

    await connection.commit();
    connection.release();

    res.status(201).json({ message: 'Estacionado na vaga escolhida', movimentacaoId: movResult.insertId, vaga: { id: vagaId, numero: vaga.numero } });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error(err);
    res.status(500).json({ message: 'Erro ao estacionar na vaga' });
  }
});

// Busca movimentação ativa por vaga
router.get('/movimentacao-ativa/:vagaId', async (req, res) => {
  try {
    const { vagaId } = req.params;
    const [rows] = await pool.query('SELECT * FROM movimentacao WHERE vaga_id = ? AND ativo = 1 LIMIT 1', [vagaId]);
    if (!rows.length) return res.status(404).json({ message: 'Nenhuma movimentação ativa nessa vaga' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar movimentação ativa' });
  }
});

// Saída (usa movimentacaoId)
router.post('/saida', async (req, res) => {
  const { movimentacaoId, valor } = req.body;
  if (!movimentacaoId) return res.status(400).json({ message: 'movimentacaoId obrigatório' });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [movs] = await connection.query('SELECT * FROM movimentacao WHERE id = ? AND ativo = 1', [movimentacaoId]);
    if (!movs.length) {
      await connection.rollback(); connection.release();
      return res.status(404).json({ message: 'Movimentação não encontrada ou já encerrada' });
    }

    const mov = movs[0];

    await connection.query('UPDATE movimentacao SET hora_saida = NOW(), valor = ?, ativo = 0 WHERE id = ?', [valor || 0, movimentacaoId]);
    await connection.query('UPDATE vaga SET ocupada = 0 WHERE id = ?', [mov.vaga_id]);

    await connection.commit();
    connection.release();

    res.json({ message: 'Saída registrada com sucesso' });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error(err);
    res.status(500).json({ message: 'Erro ao registrar saída' });
  }
});

module.exports = router;
