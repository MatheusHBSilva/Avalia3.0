function idCookieRestaurant(req, res, next) {
    const restaurantId = req.cookies.restaurantId;

    if (!restaurantId) {
        return res.status(401).json({ error: 'Não autenticado.' });
    }

    next();
}

function idQueryRestaurant(req, res, next) {
    const { restaurantId } = req.query;

    if (!restaurantId) {
        return res
        .status(400)
        .json({ error: 'ID do restaurante é obrigatório.' });
    }

    next();
}

function idBodyRestaurant(req, res, next) {
    const { restaurantId } = req.body;

    if (!restaurantId) {
        return res
        .status(400)
        .json({ error: 'ID do restaurante é obrigatório.' });
    }

    next();
}

function validateGetTag(req, res, next) {
    const { id } = req.query;

    if (!id) {
        return res
        .status(400)
        .json({ error: 'ID do restaurante é obrigatório.' });
    }

    next();
}

function validateSubmitReview(req, res, next) {
    const { restaurantId, reviewerName, rating } = req.body;

    if (!restaurantId || !reviewerName || rating == null) {
        return res
        .status(400)
        .json({ error: 'Restaurante, nome e nota são obrigatórios.' });
    }
    if (rating < 1 || rating > 5) {
        return res
        .status(400)
        .json({ error: 'A nota deve ser entre 1 e 5.' });
    }

    next();
}

function validateRegisterRestaurant(req, res, next) {
    const { restaurantName, cnpj, endereco, telefone, email, password } = req.body;

    if (!restaurantName || !cnpj || !email || !password || !endereco || !telefone) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    next();
}

// NOVO MIDDLEWARE
function validateUpdateRestaurantTags(req, res, next) {
    const { tags } = req.body;
    const restaurantId = req.cookies.restaurantId;

    if (!restaurantId) {
        return res.status(401).json({ error: 'Não autenticado para atualizar tags.' });
    }

    if (tags === undefined || tags === null) {
        return res.status(400).json({ error: 'O campo de tags é obrigatório.' });
    }

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    if (tagsArray.length === 0) {
        return res.status(400).json({ error: 'Por favor, insira pelo menos uma tag.' });
    }

    next();
}

module.exports = {idCookieRestaurant, idQueryRestaurant, validateGetTag, idBodyRestaurant, validateSubmitReview, validateRegisterRestaurant, validateUpdateRestaurantTags};