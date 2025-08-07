function validateRegisterClient(req, res, next) {
    const { nome, sobrenome, cpf, telefone, email, senha } = req.body;

    if (!nome || !sobrenome || !cpf || !telefone || !email || !senha) {
        return res
        .status(400)
        .json({ error: 'Todos os campos obrigatórios são obrigatórios.' });
    }

    next();
}

function validateGetClient(req, res, next) {
    const clientId = req.cookies.clientId;
    if (!clientId) {
        return res.status(401).json({ error: 'Não autenticado.' });
    }
    // Não precisa mais anexar req.userId, pois o ID já está em req.cookies.clientId
    next();
}

// Novo middleware para validar a atualização de tags
function validateUpdateClientTags(req, res, next) {
    const { tags } = req.body;
    const clientId = req.cookies.clientId; // Reusa a mesma lógica de ID

    if (!clientId) {
        return res.status(401).json({ error: 'Não autenticado para atualizar tags.' });
    }

    if (tags === undefined || tags === null) {
        return res.status(400).json({ error: 'O campo de tags é obrigatório.' });
    }

    // Opcional: Você pode adicionar uma validação de formato ou número mínimo/máximo de tags aqui
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    if (tagsArray.length === 0) {
        return res.status(400).json({ error: 'Por favor, insira pelo menos uma tag.' });
    }

    next();
}


module.exports = {validateRegisterClient, validateGetClient, validateUpdateClientTags};