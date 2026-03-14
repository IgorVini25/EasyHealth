const API_URL = 'http://localhost:3000/pacientes'

// Lógica dos pontos e traços no CPF e telefone
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

document.getElementById('cpf')?.addEventListener('input', e => {
  e.target.value = mascaraCPF(e.target.value)
})

document.getElementById('telefone')?.addEventListener('input', e => {
  e.target.value = mascaraTelefone(e.target.value)
})

async function carregarPacientes() {
  const resposta = await fetch(API_URL)
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

  // Envia apenas números para o banco
  const cpfLimpo = document.getElementById('cpf').value.replace(/\D/g, '')
  const telefoneLimpo = document
    .getElementById('telefone')
    .value.replace(/\D/g, '')

  if (cpfLimpo.length !== 11 || telefoneLimpo.length < 10) {
    alert('Verifique os dados digitados.')
    return
  }

  const dados = {
    nome: document.getElementById('nome').value,
    cpf: cpfLimpo,
    telefone: telefoneLimpo
  }

  try {
    const resposta = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })

    if (resposta.ok) {
      alert('Cadastrado com sucesso!')
      if (document.querySelector('#tabelaPacientes')) {
        document.getElementById('formPaciente').reset()
        carregarPacientes()
      } else {
        window.location.href = 'listagem.html'
      }
    } else {
      const erro = await resposta.json()
      alert('Erro: ' + (erro.detalhe || 'Falha no cadastro'))
    }
  } catch (error) {
    alert('Erro de conexão.')
  }
})

carregarPacientes()
