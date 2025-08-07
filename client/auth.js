// client/js/auth.js

// login  
async function login(expectedType) {  
  const email    = document.getElementById('email').value.trim();  
  const password = document.getElementById('password').value.trim();  
  const message  = document.getElementById('message');  

  // validações iniciais  
  if (!email || !password) {  
    message.textContent = 'Por favor, preencha todos os campos.';  
    message.style.display = 'block';  
    return;  
  }  

  try {  
    const res  = await fetch('/api/login', {  
      method: 'POST',  
      headers: { 'Content-Type': 'application/json' },  
      credentials: 'include',  
      body: JSON.stringify({ email, password })  
    });  

    const data = await res.json();  
    if (!res.ok) {  
      message.textContent = data.error || 'Erro ao fazer login.';  
      message.style.display = 'block';  
      return;  
    }  

    // checa se bate com o tipo de página  
    if (data.userType !== expectedType) {  
      message.textContent = 'Acesse a página de login correta.';  
      message.style.display = 'block';  
      return;  
    }  

    // redirecionamento conforme o tipo  
    window.location.href = data.userType === 'restaurant'  
      ? '/Restaurante/restaurant_dashboard.html'  
      : '/Cliente/Client_dashboard.html';  

  } catch (err) {  
    console.error('Erro no login:', err);  
    message.textContent = 'Erro ao conectar ao servidor.';  
    message.style.display = 'block';  
  }  
}  

// logout  
async function logout() {  
  try {  
    await fetch('/api/logout', {  
      method: 'POST',  
      credentials: 'include'  
    });  
  } catch (err) {  
    console.error('Erro ao fazer logout:', err);  
  } finally {  
    window.location.href = '/index.html';  
  }  
}  

// torna funções acessíveis globalmente  
window.login  = login;  
window.logout = logout;
