async function register() {
  const restaurantName = document.getElementById('restaurantName').value;
  const cnpj = document.getElementById('cnpj').value;
  const endereco = document.getElementById('endereco').value;
  const telefone = document.getElementById('telefone').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const tags = document.getElementById('tags').value;
  const message = document.getElementById('message');

  message.style.display = 'none';

  if (!restaurantName || !cnpj || !email || !password || !endereco || !telefone) {
    message.textContent = 'Por favor, preencha todos os campos obrigatórios.';
    message.classList.add('error');
    message.style.display = 'block';
    return;
  }

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantName, cnpj, email, endereco, telefone, password, tags })
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
    document.getElementById('restaurantName').value = '';
    document.getElementById('cnpj').value = '';
    document.getElementById('endereco').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('tags').value = '';
  } catch (error) {
    message.textContent = 'Erro ao conectar ao servidor.';
    message.classList.add('error');
    message.style.display = 'block';
    console.error('Erro no cadastro:', error);
  }
}