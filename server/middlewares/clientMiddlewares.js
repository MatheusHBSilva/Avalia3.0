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

    next();
}

module.exports = {validateRegisterClient, validateGetClient};