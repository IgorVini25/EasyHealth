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
async function carregarPacientes() {
  const resposta = await fetch(API_PACIENTES)
  const pacientes = await resposta.json()
  const tbody = document.querySelector('#tabelaPacientes tbody')

  if (!tbody) return

  tbody.innerHTML = ''
  pacientes.forEach(p => {
    tbody.innerHTML += `<tr>
            <td>${p.nome}</td>
            <td>${mascaraCPF(p.cpf)}</td> 
            <td>${mascaraTelefone(p.telefone)}</td>
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

// Medicos
async function carregarMedicos() {
  const tbody = document.querySelector('#tabelaMedicos tbody')
  if (!tbody) return

  const filtro =
    document.getElementById('filtroEspecialidade')?.value || 'Todos'
  const resposta = await fetch(API_MEDICOS)
  const medicos = await resposta.json()

  tbody.innerHTML = ''

  const lista =
    filtro === 'Todos'
      ? medicos
      : medicos.filter(m => m.especialidade === filtro)

  lista.forEach(m => {
    tbody.innerHTML += `<tr>
            <td>${m.nome}</td>
            <td>${m.crm}</td>
            <td><span class="badge bg-info text-dark">${m.especialidade}</span></td>
            <td>${mascaraTelefone(m.telefone)}</td>
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
async function carregarAgendamentos() {
  const tbody = document.querySelector('#tabelaAgendamentos tbody')
  if (!tbody) return

  const filtro = document.getElementById('filtroAgenda')?.value || 'Todos'
  const res = await fetch(API_AGENDAMENTOS)
  const agendamentos = await res.json()

  tbody.innerHTML = ''

  // Filtra pela especialidade do médico dentro do agendamento
  const lista =
    filtro === 'Todos'
      ? agendamentos
      : agendamentos.filter(a => a.medico?.especialidade === filtro)

  if (lista.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="text-center text-muted">Nenhuma consulta encontrada.</td></tr>'
    return
  }

  lista.forEach(a => {
    const dataBr = a.data.split('-').reverse().join('/')

    // Define a cor do badge baseada no status (se houver)
    const corStatus =
      a.status === 'Agendado' ? 'bg-warning text-dark' : 'bg-success'

    tbody.innerHTML += `<tr>
        <td><strong>${a.paciente?.nome || 'N/A'}</strong></td>
        <td>${a.medico?.nome || 'N/A'}</td>
        <td><span class="badge bg-light text-dark border">${a.medico?.especialidade || 'N/A'}</span></td>
        <td>
            <div class="small">${dataBr} às ${a.horario}</div>
            <span class="badge ${corStatus}" style="font-size: 0.7rem;">${a.status || 'Agendado'}</span>
        </td>
    </tr>`
  })
}

// Evento do filtro
document
  .getElementById('filtroAgenda')
  ?.addEventListener('change', carregarAgendamentos)

// Inicialização
prepararAgendamento()
carregarAgendamentos()
