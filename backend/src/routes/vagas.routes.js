const express = require('express');
const router = express.Router();
const pool = require('../db');

// listar vagas
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vaga ORDER BY numero');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar vagas' });
  }
});

// status resumo
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

module.exports = router;
