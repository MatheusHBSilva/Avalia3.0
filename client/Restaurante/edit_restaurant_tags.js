document.addEventListener('DOMContentLoaded', loadRestaurantTags);

async function loadRestaurantTags() {
    const currentTagsInput = document.getElementById('current-tags');
    const message = document.getElementById('message');
    message.style.display = 'none';

    try {
        const response = await fetch('/api/restaurant/me', { credentials: 'include' });
        const restaurantData = await response.json();

        if (!response.ok) {
            message.textContent = restaurantData.error || 'Erro ao carregar informações do restaurante.';
            message.classList.add('error');
            message.style.display = 'block';
            return;
        }
        
        currentTagsInput.value = restaurantData.tags ? restaurantData.tags.join(', ') : '';

    } catch (error) {
        console.error('Erro ao carregar tags do restaurante:', error);
        message.textContent = 'Erro ao conectar ao servidor para carregar tags.';
        message.classList.add('error');
        message.style.display = 'block';
    }
}

async function saveTags() {
  const newTagsInput = document.getElementById('new-tags');
  const message = document.getElementById('message');
  const tagsString = newTagsInput.value.trim(); // Pega o texto do input

  message.style.display = 'none';
  message.classList.remove('error', 'success');

  // --- VALIDAÇÃO ADICIONADA AQUI ---
  // 1. Cria um array a partir da string de tags
  const tagsArray = tagsString.split(',')
    .map(tag => tag.trim())
    .filter(tag => tag !== '');

  // 2. Verifica se a string está vazia ou se tem menos de 5 tags
  if (tagsArray.length === 0) {
    message.textContent = 'Por favor, insira pelo menos uma tag.';
    message.classList.add('error');
    message.style.display = 'block';
    return;
  }
  
  if (tagsArray.length < 5) {
    message.textContent = 'É necessário informar no mínimo 5 tags válidas.';
    message.classList.add('error');
    message.style.display = 'block';
    return; // Para a execução antes de enviar para a API
  }
  // --- FIM DA VALIDAÇÃO ---

  try {
    // A API ainda espera receber a string original
    const response = await fetch('/api/update-restaurant-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: tagsString }), // Envia a string
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      // Mostra o erro vindo do backend (nossa barreira de segurança)
      message.textContent = data.error || 'Erro ao salvar as tags.';
      message.classList.add('error');
      message.style.display = 'block';
      return;
    }

    message.textContent = data.message || 'Tags salvas com sucesso!';
    message.classList.add('success');
    message.style.display = 'block';
    
    // Atualiza o campo de tags atuais com os dados retornados
    document.getElementById('current-tags').value = data.updatedTags.join(', ');
    newTagsInput.value = '';

  } catch (error) {
    console.error('Erro ao salvar tags:', error);
    message.textContent = 'Erro ao conectar ao servidor para salvar tags.';
    message.classList.add('error');
    message.style.display = 'block';
  }
}