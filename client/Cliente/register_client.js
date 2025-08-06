async function registerClient() {
  //receber do html as informações
  const nome = document.getElementById('nome').value;
  const sobrenome = document.getElementById('sobrenome').value;
  const cpf = document.getElementById('cpf').value;
  const telefone = document.getElementById('telefone').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const tags = document.getElementById('tags').value;
  const message = document.getElementById('message');

  message.style.display = 'none';

  if (!nome || !sobrenome || !cpf || !telefone || !email || !senha || !tags)    
    {
    message.textContent = 'Por favor, preencha todos os campos obrigatórios.';
    message.classList.add('error');
    message.style.display = 'block';
    return;
  }

  //contato com o servidor
  try {
    const response = await fetch('/api/register-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, sobrenome, cpf, telefone, email, senha, tags})
    });

    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.error || 'Erro ao cadastrar.';
      message.classList.add('error');
      message.style.display = 'block';
      return;
    }

    message.textContent = data.message;
    message.classList.remove('error');
    message.classList.add('success');
    message.style.display = 'block';

    // Limpar formulário
    document.getElementById('nome').value = '';
    document.getElementById('sobrenome').value = '';
    document.getElementById('cpf').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('email').value = '';
    document.getElementById('senha').value = '';
    document.getElementById('tags').value = '';

  //Não conectou ao servidor
  } catch (error) {
    message.textContent = 'Erro ao conectar ao servidor.';
    message.classList.add('error');
    message.style.display = 'block';
    console.error('Erro no cadastro:', error);
  }
}