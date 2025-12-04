const express = require('express');
const router = express.Router();
const pool = require('../db');

// Status geral das vagas
router.get('/status', async (req, res) => {
  try {
    const [[totais]] = await pool.query(
      `SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN ocupada = 0 THEN 1 ELSE 0 END) AS livres,
          SUM(CASE WHEN ocupada = 1 THEN 1 ELSE 0 END) AS ocupadas
       FROM vaga`
    );
    res.json(totais);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar status das vagas' });
  }
});

// CRUD simples de vagas (opcional, para gerenciar vagas pelo sistema)
router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM vaga ORDER BY numero');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { numero } = req.body;
  const [result] = await pool.query('INSERT INTO vaga (numero, ocupada) VALUES (?,0)', [numero]);
  res.status(201).json({ id: result.insertId, numero, ocupada: 0 });
});

router.put('/:id', async (req, res) => {
  const { numero, ocupada } = req.body;
  await pool.query('UPDATE vaga SET numero=?, ocupada=? WHERE id=?', [numero, ocupada, req.params.id]);
  res.json({ message: 'Vaga atualizada' });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM vaga WHERE id=?', [req.params.id]);
  res.json({ message: 'Vaga excluída' });
});

module.exports = router;
