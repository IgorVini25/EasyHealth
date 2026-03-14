const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, '..', 'public')))

// Conexão com o MongDB
mongoose
  .connect('mongodb://127.0.0.1:27017/easyhealth')
  .then(() => console.log('Conectado ao DB'))
  .catch(err => console.error('Erro ao conectar ao DB: ', err))

// Schema da tabela Paciente
const PacienteSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  cpf: { type: String, required: true, unique: true },
  telefone: { type: String, required: true },
  dataCadastro: { type: Date, default: Date.now }
})

const Paciente = mongoose.model('Paciente', PacienteSchema)

// Rotas
app.post('/pacientes', async (req, res) => {
  try {
    const novoPaciente = new Paciente(req.body)
    await novoPaciente.save()
    res
      .status(201)
      .json({ mensagem: 'Paciente cadastrado!', paciente: novoPaciente })
  } catch (error) {
    res
      .status(400)
      .json({ mensagem: 'Erro ao cadastrar.', detalhe: error.message })
  }
})

app.get('/pacientes', async (req, res) => {
  try {
    const lista = await Paciente.find()
    res.status(200).json(lista)
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao buscar pacientes' })
  }
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})
