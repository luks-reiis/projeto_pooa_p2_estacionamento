const express = require('express');
const cors = require('cors');
require('dotenv').config();

const veiculosRoutes = require('./routes/veiculos.routes');
const vagasRoutes = require('./routes/vagas.routes');
const estacionamentoRoutes = require('./routes/estacionamento.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/veiculos', veiculosRoutes);
app.use('/api/vagas', vagasRoutes);
app.use('/api/estacionamento', estacionamentoRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
