const express = require('express');
const router = express.Router();
const pool = require('../db');
const upload = require('../middlewares/upload');

// CREATE with foto
router.post('/', upload.single('foto'), async (req, res) => {
  try {
    const { placa, modelo, cor, proprietario } = req.body;
    const foto = req.file ? req.file.filename : null;

    const [result] = await pool.query(
      'INSERT INTO veiculo (placa, modelo, cor, proprietario, foto) VALUES (?,?,?,?,?)',
      [placa, modelo, cor, proprietario, foto]
    );

    res.status(201).json({ id: result.insertId, placa, modelo, cor, proprietario, foto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao cadastrar veículo' });
  }
});

// READ veiculos livres
router.get('/', async (req, res) => {
  try {
    const livres = req.query.livres;
    let sql = 'SELECT * FROM veiculo';
    const params = [];
    if (livres === '1' || livres === 'true') {
      sql += ' WHERE estacionado = 0';
    }
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar veículos' });
  }
});


// READ one
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM veiculo WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Veículo não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar veículo' });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const { placa, modelo, cor, proprietario } = req.body;
    await pool.query('UPDATE veiculo SET placa=?, modelo=?, cor=?, proprietario=? WHERE id=?',
      [placa, modelo, cor, proprietario, req.params.id]);
    res.json({ message: 'Veículo atualizado' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar veículo' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM veiculo WHERE id=?', [req.params.id]);
    res.json({ message: 'Veículo removido' });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Erro ao remover veículo' });
  }
});

module.exports = router;
