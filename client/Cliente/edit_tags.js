document.addEventListener('DOMContentLoaded', loadUserTags);

async function loadUserTags() {
    const currentTagsInput = document.getElementById('current-tags');
    const message = document.getElementById('message');

    try {
        const response = await fetch('/api/client-me', { credentials: 'include' });
        const clientData = await response.json();

        if (!response.ok) {
            message.textContent = clientData.error || 'Erro ao carregar informações do cliente.';
            message.classList.add('error');
            return;
        }

        currentTagsInput.value = clientData.tags ? clientData.tags.join(', ') : '';
    } catch (error) {
        console.error('Erro ao carregar tags do usuário:', error);
        message.textContent = 'Erro ao conectar ao servidor para carregar tags.';
        message.classList.add('error');
    }
}

async function saveTags() {
    const newTagsInput = document.getElementById('new-tags');
    const message = document.getElementById('message');
    const tags = newTagsInput.value.trim();

    message.style.display = 'none';

    if (!tags) {
        message.textContent = 'Por favor, insira pelo menos uma tag.';
        message.classList.add('error');
        message.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('/api/update-client-tags', { // Você precisará criar este endpoint no seu backend
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tags }),
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.error || 'Erro ao salvar as tags.';
            message.classList.add('error');
            message.style.display = 'block';
            return;
        }

        message.textContent = 'Tags salvas com sucesso!';
        message.classList.remove('error');
        message.classList.add('success');
        message.style.display = 'block';
        
        // Atualiza o campo de tags atuais após salvar
        document.getElementById('current-tags').value = tags;
        newTagsInput.value = ''; // Limpa o campo de novas tags
    } catch (error) {
        console.error('Erro ao salvar tags:', error);
        message.textContent = 'Erro ao conectar ao servidor para salvar tags.';
        message.classList.add('error');
        message.style.display = 'block';
    }
}