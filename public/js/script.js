const API_PACIENTES = 'http://localhost:3000/pacientes'
const API_MEDICOS = 'http://localhost:3000/medicos'

// Mascaras
const mascaraCPF = valor => {
  return valor
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

const mascaraTelefone = valor => {
  return valor
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1')
}

document
  .getElementById('cpf')
  ?.addEventListener(
    'input',
    e => (e.target.value = mascaraCPF(e.target.value))
  )
document
  .getElementById('telefone')
  ?.addEventListener(
    'input',
    e => (e.target.value = mascaraTelefone(e.target.value))
  )
document
  .getElementById('telefoneMedico')
  ?.addEventListener(
    'input',
    e => (e.target.value = mascaraTelefone(e.target.value))
  )

// Pacientes
let pacientesLista = []

async function carregarPacientes() {
  const resposta = await fetch(API_PACIENTES)
  pacientesLista = await resposta.json()
  const tbody = document.querySelector('#tabelaPacientes tbody')

  if (!tbody) return

  tbody.innerHTML = ''
  pacientesLista.forEach(p => {
    tbody.innerHTML += `<tr>
            <td class="ps-4">${p.nome}</td>
            <td>${mascaraCPF(p.cpf)}</td> 
            <td>${mascaraTelefone(p.telefone)}</td>
            <td class="pe-4">
              <button onclick="abrirEditarPaciente('${p._id}')" class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#modalEditarPaciente">
                <i class="bi bi-pencil"></i> Editar
              </button>
            </td>
        </tr>`
  })
}

document.getElementById('formPaciente')?.addEventListener('submit', async e => {
  e.preventDefault()

  const cpfLimpo = document.getElementById('cpf').value.replace(/\D/g, '')
  const telLimpo = document.getElementById('telefone').value.replace(/\D/g, '')

  const dados = {
    nome: document.getElementById('nome').value,
    cpf: cpfLimpo,
    telefone: telLimpo
  }

  const res = await fetch(API_PACIENTES, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  })

  if (res.ok) {
    alert('Cadastrado com sucesso!')
    window.location.href = 'listagem.html'
  }
})

function abrirEditarPaciente(id) {
  const p = pacientesLista.find(item => item._id === id)
  if (!p) return

  document.getElementById('editPacienteId').value = p._id
  document.getElementById('editNomePaciente').value = p.nome
  document.getElementById('editCpfPaciente').value = mascaraCPF(p.cpf)
  document.getElementById('editTelefonePaciente').value = mascaraTelefone(p.telefone)
}

document.getElementById('formEditarPaciente')?.addEventListener('submit', async e => {
  e.preventDefault()

  const id = document.getElementById('editPacienteId').value
  const cpfLimpo = document.getElementById('editCpfPaciente').value.replace(/\D/g, '')
  const telLimpo = document.getElementById('editTelefonePaciente').value.replace(/\D/g, '')

  const dados = {
    nome: document.getElementById('editNomePaciente').value,
    cpf: cpfLimpo,
    telefone: telLimpo
  }

  const res = await fetch(`${API_PACIENTES}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  })

  if (res.ok) {
    alert('Paciente atualizado com sucesso!')
    const modalEl = document.getElementById('modalEditarPaciente')
    const modal = bootstrap.Modal.getInstance(modalEl)
    modal?.hide()
    carregarPacientes()
  } else {
    const err = await res.json()
    alert('Erro ao atualizar: ' + (err.mensagem || err.detalhe || 'Erro desconhecido'))
  }
})

document
  .getElementById('editCpfPaciente')
  ?.addEventListener(
    'input',
    e => (e.target.value = mascaraCPF(e.target.value))
  )
document
  .getElementById('editTelefonePaciente')
  ?.addEventListener(
    'input',
    e => (e.target.value = mascaraTelefone(e.target.value))
  )

// Medicos
let medicosLista = []

async function carregarMedicos() {
  const tbody = document.querySelector('#tabelaMedicos tbody')
  if (!tbody) return

  const filtro =
    document.getElementById('filtroEspecialidade')?.value || 'Todos'
  const resposta = await fetch(API_MEDICOS)
  medicosLista = await resposta.json()

  tbody.innerHTML = ''

  const lista =
    filtro === 'Todos'
      ? medicosLista
      : medicosLista.filter(m => m.especialidade === filtro)

  lista.forEach(m => {
    tbody.innerHTML += `<tr>
            <td class="ps-4">${m.nome}</td>
            <td>${m.crm}</td>
            <td><span class="badge bg-info text-dark">${m.especialidade}</span></td>
            <td>${mascaraTelefone(m.telefone)}</td>
            <td class="pe-4">
              <button onclick="abrirEditarMedico('${m._id}')" class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#modalEditarMedico">
                <i class="bi bi-pencil"></i> Editar
              </button>
            </td>
        </tr>`
  })
}

document.getElementById('formMedico')?.addEventListener('submit', async e => {
  e.preventDefault()

  const dados = {
    nome: document.getElementById('nomeMedico').value,
    crm: document.getElementById('crm').value,
    especialidade: document.getElementById('especialidade').value,
    telefone: document.getElementById('telefoneMedico').value.replace(/\D/g, '')
  }

  const res = await fetch(API_MEDICOS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  })

  if (res.ok) {
    alert('Médico cadastrado!')
    window.location.href = 'listagem-medicos.html'
  }
})

document
  .getElementById('filtroEspecialidade')
  ?.addEventListener('change', carregarMedicos)

function abrirEditarMedico(id) {
  const m = medicosLista.find(item => item._id === id)
  if (!m) return

  document.getElementById('editMedicoId').value = m._id
  document.getElementById('editNomeMedico').value = m.nome
  document.getElementById('editCrmMedico').value = m.crm
  document.getElementById('editEspecialidadeMedico').value = m.especialidade
  document.getElementById('editTelefoneMedico').value = mascaraTelefone(m.telefone)
}

document.getElementById('formEditarMedico')?.addEventListener('submit', async e => {
  e.preventDefault()

  const id = document.getElementById('editMedicoId').value
  const telLimpo = document.getElementById('editTelefoneMedico').value.replace(/\D/g, '')

  const dados = {
    nome: document.getElementById('editNomeMedico').value,
    crm: document.getElementById('editCrmMedico').value,
    especialidade: document.getElementById('editEspecialidadeMedico').value,
    telefone: telLimpo
  }

  const res = await fetch(`${API_MEDICOS}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  })

  if (res.ok) {
    alert('Médico atualizado com sucesso!')
    const modalEl = document.getElementById('modalEditarMedico')
    const modal = bootstrap.Modal.getInstance(modalEl)
    modal?.hide()
    carregarMedicos()
  } else {
    const err = await res.json()
    alert('Erro ao atualizar: ' + (err.mensagem || err.detalhe || 'Erro desconhecido'))
  }
})

document
  .getElementById('editTelefoneMedico')
  ?.addEventListener(
    'input',
    e => (e.target.value = mascaraTelefone(e.target.value))
  )

// Inicialização
carregarPacientes()
carregarMedicos()

const API_AGENDAMENTOS = 'http://localhost:3000/agendamentos'

// Puxa pacientes e médicos pros selects
async function prepararAgendamento() {
  const selP = document.getElementById('selectPaciente')
  const selM = document.getElementById('selectMedico')
  if (!selP || !selM) return

  const [resP, resM] = await Promise.all([
    fetch(API_PACIENTES),
    fetch(API_MEDICOS)
  ])
  const pacientes = await resP.json()
  const medicos = await resM.json()

  selP.innerHTML = '<option value="">Selecione o paciente...</option>'
  pacientes.forEach(
    p => (selP.innerHTML += `<option value="${p._id}">${p.nome}</option>`)
  )

  selM.innerHTML = '<option value="">Selecione o médico...</option>'
  medicos.forEach(
    m =>
      (selM.innerHTML += `<option value="${m._id}">${m.nome} (${m.especialidade})</option>`)
  )
}

// Salva a consulta
document
  .getElementById('formAgendamento')
  ?.addEventListener('submit', async e => {
    e.preventDefault()

    const dados = {
      paciente: document.getElementById('selectPaciente').value,
      medico: document.getElementById('selectMedico').value,
      data: document.getElementById('dataConsulta').value,
      horario: document.getElementById('horaConsulta').value
    }

    const res = await fetch(API_AGENDAMENTOS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })

    if (res.ok) {
      alert('Consulta agendada!')
      window.location.href = 'listagem-agendamentos.html'
    }
  })

// Adicione carregarAgendamentos() e o init
// Listagem de agendamentos com filtro e status
let agendamentosLista = []

async function carregarAgendamentos() {
  const tbody = document.querySelector('#tabelaAgendamentos tbody')
  if (!tbody) return

  const filtro = document.getElementById('filtroAgenda')?.value || 'Todos'
  const res = await fetch(API_AGENDAMENTOS)
  agendamentosLista = await res.json()

  tbody.innerHTML = ''

  // Filtra pela especialidade do médico dentro do agendamento
  const lista =
    filtro === 'Todos'
      ? agendamentosLista
      : agendamentosLista.filter(a => a.medico?.especialidade === filtro)

  if (lista.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="text-center text-muted">Nenhuma consulta encontrada.</td></tr>'
    return
  }

  lista.forEach(a => {
    const dataBr = a.data.split('-').reverse().join('/')

    // Define a cor do badge baseada no status (se houver)
    let corStatus = 'bg-warning text-dark'
    if (a.status === 'Realizado') {
      corStatus = 'bg-success'
    } else if (a.status === 'Cancelado') {
      corStatus = 'bg-danger'
    }

    tbody.innerHTML += `<tr>
        <td class="ps-4"><strong>${a.paciente?.nome || 'N/A'}</strong></td>
        <td>${a.medico?.nome || 'N/A'}</td>
        <td><span class="badge bg-light text-dark border">${a.medico?.especialidade || 'N/A'}</span></td>
        <td>
            <div class="small">${dataBr} às ${a.horario}</div>
            <span class="badge ${corStatus}" style="font-size: 0.7rem;">${a.status || 'Agendado'}</span>
        </td>
        <td class="pe-4">
          <button onclick="abrirEditarAgendamento('${a._id}')" class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#modalEditarAgendamento">
            <i class="bi bi-pencil"></i> Editar
          </button>
        </td>
    </tr>`
  })
}

// Evento do filtro
document
  .getElementById('filtroAgenda')
  ?.addEventListener('change', carregarAgendamentos)

async function prepararSelectsEdicao() {
  const selP = document.getElementById('editSelectPaciente')
  const selM = document.getElementById('editSelectMedico')
  if (!selP || !selM) return

  if (selP.options.length > 0 && selM.options.length > 0) return

  const [resP, resM] = await Promise.all([
    fetch(API_PACIENTES),
    fetch(API_MEDICOS)
  ])
  const pacientes = await resP.json()
  const medicos = await resM.json()

  selP.innerHTML = '<option value="">Selecione o paciente...</option>'
  pacientes.forEach(
    p => (selP.innerHTML += `<option value="${p._id}">${p.nome}</option>`)
  )

  selM.innerHTML = '<option value="">Selecione o médico...</option>'
  medicos.forEach(
    m =>
      (selM.innerHTML += `<option value="${m._id}">${m.nome} (${m.especialidade})</option>`)
  )
}

async function abrirEditarAgendamento(id) {
  const a = agendamentosLista.find(item => item._id === id)
  if (!a) return

  await prepararSelectsEdicao()

  document.getElementById('editAgendamentoId').value = a._id
  document.getElementById('editSelectPaciente').value = a.paciente?._id || ''
  document.getElementById('editSelectMedico').value = a.medico?._id || ''
  document.getElementById('editDataConsulta').value = a.data
  document.getElementById('editHoraConsulta').value = a.horario
  document.getElementById('editStatusConsulta').value = a.status || 'Agendado'
}

document.getElementById('formEditarAgendamento')?.addEventListener('submit', async e => {
  e.preventDefault()

  const id = document.getElementById('editAgendamentoId').value
  const dados = {
    paciente: document.getElementById('editSelectPaciente').value,
    medico: document.getElementById('editSelectMedico').value,
    data: document.getElementById('editDataConsulta').value,
    horario: document.getElementById('editHoraConsulta').value,
    status: document.getElementById('editStatusConsulta').value
  }

  const res = await fetch(`${API_AGENDAMENTOS}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  })

  if (res.ok) {
    alert('Agendamento atualizado com sucesso!')
    const modalEl = document.getElementById('modalEditarAgendamento')
    const modal = bootstrap.Modal.getInstance(modalEl)
    modal?.hide()
    carregarAgendamentos()
  } else {
    const err = await res.json()
    alert('Erro ao atualizar: ' + (err.mensagem || err.detalhe || 'Erro desconhecido'))
  }
})

// Variáveis globais para armazenar os dados no módulo de relatórios
let relatoriosDados = {
  pacientes: [],
  medicos: [],
  agendamentos: []
}

// Função para buscar todos os dados de relatórios e inicializar as telas
async function carregarTodosDadosRelatorios() {
  if (!document.getElementById('abasRelatorios')) return // Só roda na tela de relatórios

  try {
    const [resP, resM, resA] = await Promise.all([
      fetch(API_PACIENTES),
      fetch(API_MEDICOS),
      fetch(API_AGENDAMENTOS)
    ])

    relatoriosDados.pacientes = await resP.json()
    relatoriosDados.medicos = await resM.json()
    relatoriosDados.agendamentos = await resA.json()

    // Inicializa todos os painéis e relatórios
    gerarRelatorioEstatisticas()
    gerarRelatorioConsultas()
    gerarRelatorioPacientes()
    gerarRelatorioMedicos()
  } catch (error) {
    console.error('Erro ao buscar dados para os relatórios:', error)
  }
}

// 1. Aba Estatísticas Gerais
function gerarRelatorioEstatisticas() {
  const kpiConsultas = document.getElementById('kpi-consultas')
  const kpiPacientes = document.getElementById('kpi-pacientes')
  const kpiMedicos = document.getElementById('kpi-medicos')
  const kpiEspecialidade = document.getElementById('kpi-especialidade')
  const tbodyEsp = document.querySelector('#tabelaEspecialidades tbody')

  if (kpiConsultas) kpiConsultas.innerText = relatoriosDados.agendamentos.length
  if (kpiPacientes) kpiPacientes.innerText = relatoriosDados.pacientes.length
  if (kpiMedicos) kpiMedicos.innerText = relatoriosDados.medicos.length

  // Encontra especialidade mais procurada
  const contagemEspecialidades = {}
  relatoriosDados.agendamentos.forEach(a => {
    const esp = a.medico?.especialidade
    if (esp) {
      contagemEspecialidades[esp] = (contagemEspecialidades[esp] || 0) + 1
    }
  })

  let maisProcurada = 'Nenhuma'
  let maxConsultas = 0
  for (const [esp, count] of Object.entries(contagemEspecialidades)) {
    if (count > maxConsultas) {
      maxConsultas = count
      maisProcurada = `${esp} (${count})`
    }
  }
  if (kpiEspecialidade) kpiEspecialidade.innerText = maisProcurada

  // Tabela de Distribuição por Especialidade
  if (tbodyEsp) {
    tbodyEsp.innerHTML = ''
    const listaEspecialidades = [
      'Cardiologia', 'Dermatologia', 'Ginecologia', 'Neurologia',
      'Ortopedia', 'Pediatria', 'Psiquiatria', 'Urologia'
    ]

    listaEspecialidades.forEach(esp => {
      const totalMedicos = relatoriosDados.medicos.filter(m => m.especialidade === esp).length
      const totalAgendamentos = relatoriosDados.agendamentos.filter(a => a.medico?.especialidade === esp).length

      tbodyEsp.innerHTML += `<tr>
        <td class="ps-4"><strong>${esp}</strong></td>
        <td>${totalMedicos}</td>
        <td class="pe-4">${totalAgendamentos}</td>
      </tr>`
    })
  }
}

// 2. Aba Relatório de Consultas
function gerarRelatorioConsultas() {
  const tbody = document.querySelector('#tabelaRelatorios tbody')
  if (!tbody) return

  const pacienteFiltro = document.getElementById('filtroPaciente')?.value.trim().toLowerCase() || ''
  const especialidadeFiltro = document.getElementById('filtroEspecialidadeRelatorio')?.value || 'Todos'
  const dataInicioFiltro = document.getElementById('filtroDataInicio')?.value || ''
  const dataFimFiltro = document.getElementById('filtroDataFim')?.value || ''

  const listaFiltrada = relatoriosDados.agendamentos.filter(a => {
    // Filtrar por paciente
    if (pacienteFiltro) {
      const nomePaciente = a.paciente?.nome?.toLowerCase() || ''
      if (!nomePaciente.includes(pacienteFiltro)) return false
    }

    // Filtrar por especialidade
    if (especialidadeFiltro !== 'Todos') {
      const especialidadeMedico = a.medico?.especialidade || ''
      if (especialidadeMedico !== especialidadeFiltro) return false
    }

    // Filtrar por data inicial (inclusive)
    if (dataInicioFiltro && a.data < dataInicioFiltro) return false

    // Filtrar por data final (inclusive)
    if (dataFimFiltro && a.data > dataFimFiltro) return false

    return true
  })

  tbody.innerHTML = ''

  if (listaFiltrada.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted fw-bold">Nenhum dado encontrado</td></tr>'
    return
  }

  listaFiltrada.forEach(a => {
    const dataBr = a.data.split('-').reverse().join('/')
    tbody.innerHTML += `<tr>
        <td class="ps-4"><strong>${a.paciente?.nome || 'N/A'}</strong></td>
        <td>${a.medico?.nome || 'N/A'}</td>
        <td><span class="badge bg-light text-dark border">${a.medico?.especialidade || 'N/A'}</span></td>
        <td class="pe-4">${dataBr} às ${a.horario}</td>
    </tr>`
  })
}

// 3. Aba Relatório de Pacientes
function gerarRelatorioPacientes() {
  const tbody = document.querySelector('#tabelaRelatorioPacientes tbody')
  if (!tbody) return

  const busca = document.getElementById('buscaPaciente')?.value.trim().toLowerCase() || ''

  const pacientesFiltrados = relatoriosDados.pacientes.filter(p => {
    if (busca) {
      const nome = p.nome.toLowerCase()
      const cpf = p.cpf.replace(/\D/g, '')
      const buscaLimpa = busca.replace(/\D/g, '')
      return nome.includes(busca) || cpf.includes(buscaLimpa)
    }
    return true
  })

  tbody.innerHTML = ''

  if (pacientesFiltrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted fw-bold">Nenhum paciente encontrado</td></tr>'
    return
  }

  pacientesFiltrados.forEach(p => {
    const agendamentosPaciente = relatoriosDados.agendamentos.filter(a => a.paciente?._id === p._id)
    const totalConsultas = agendamentosPaciente.length

    // Achar a consulta mais recente
    let ultimaConsultaStr = 'Nenhuma'
    if (totalConsultas > 0) {
      const ordenados = [...agendamentosPaciente].sort((a, b) => b.data.localeCompare(a.data) || b.horario.localeCompare(a.horario))
      const maisRecente = ordenados[0]
      ultimaConsultaStr = `${maisRecente.data.split('-').reverse().join('/')} às ${maisRecente.horario}`
    }

    tbody.innerHTML += `<tr>
      <td class="ps-4"><strong>${p.nome}</strong></td>
      <td>${mascaraCPF(p.cpf)}</td>
      <td>${mascaraTelefone(p.telefone)}</td>
      <td><span class="badge bg-primary">${totalConsultas}</span></td>
      <td class="pe-4">${ultimaConsultaStr}</td>
    </tr>`
  })
}

// 4. Aba Relatório de Médicos
function gerarRelatorioMedicos() {
  const tbody = document.querySelector('#tabelaRelatorioMedicos tbody')
  if (!tbody) return

  const busca = document.getElementById('buscaMedico')?.value.trim().toLowerCase() || ''

  const medicosFiltrados = relatoriosDados.medicos.filter(m => {
    if (busca) {
      const nome = m.nome.toLowerCase()
      const especialidade = m.especialidade.toLowerCase()
      return nome.includes(busca) || especialidade.includes(busca)
    }
    return true
  })

  tbody.innerHTML = ''

  if (medicosFiltrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted fw-bold">Nenhum médico encontrado</td></tr>'
    return
  }

  medicosFiltrados.forEach(m => {
    const totalConsultas = relatoriosDados.agendamentos.filter(a => a.medico?._id === m._id).length

    tbody.innerHTML += `<tr>
      <td class="ps-4"><strong>${m.nome}</strong></td>
      <td>${m.crm}</td>
      <td><span class="badge bg-light text-dark border">${m.especialidade}</span></td>
      <td>${mascaraTelefone(m.telefone)}</td>
      <td class="pe-4"><span class="badge bg-success">${totalConsultas}</span></td>
    </tr>`
  })
}

// Inicialização
prepararAgendamento()
carregarAgendamentos()
carregarTodosDadosRelatorios()
