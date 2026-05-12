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

// Schema da tabela Medico
const MedicoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  crm: { type: String, required: true, unique: true },
  especialidade: { type: String, required: true },
  telefone: { type: String, required: true }
})

// Modelo de Agendamento
const AgendamentoSchema = new mongoose.Schema({
  paciente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: true
  },
  medico: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medico',
    required: true
  },
  data: { type: String, required: true },
  horario: { type: String, required: true },
  status: { type: String, default: 'Agendado' }
})

const Medico = mongoose.model('Medico', MedicoSchema)

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

app.post('/medicos', async (req, res) => {
  try {
    const novoMedico = new Medico(req.body)
    await novoMedico.save()
    res.status(201).json({ mensagem: 'Médico cadastrado!' })
  } catch (error) {
    res
      .status(400)
      .json({ mensagem: 'Erro ao cadastrar', detalhe: error.message })
  }
})

app.get('/medicos', async (req, res) => {
  try {
    const lista = await Medico.find()
    res.status(200).json(lista)
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao buscar médicos' })
  }
})

const Agendamento = mongoose.model('Agendamento', AgendamentoSchema)

// Rota para criar agendamento
app.post('/agendamentos', async (req, res) => {
  try {
    const novo = new Agendamento(req.body)
    await novo.save()
    res.status(201).json({ mensagem: 'Consulta agendada!' })
  } catch (error) {
    res
      .status(400)
      .json({ mensagem: 'Erro ao agendar', detalhe: error.message })
  }
})

// Rota para listar (usando populate para trazer os nomes em vez de só IDs)
app.get('/agendamentos', async (req, res) => {
  try {
    const lista = await Agendamento.find()
      .populate('paciente', 'nome')
      .populate('medico', 'nome especialidade')
    res.status(200).json(lista)
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao buscar agendamentos' })
  }
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})
