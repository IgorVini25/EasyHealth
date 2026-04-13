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
