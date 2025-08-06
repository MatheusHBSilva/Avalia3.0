const {idCookieRestaurant, idQueryRestaurant, validateGetTag, idBodyRestaurant, validateSubmitReview, validateRegisterRestaurant} = require('../../middlewares/restaurantMiddlewares');

describe('validateRegisterRestaurant middleware', () => {
    let req, res, next;

    beforeEach( () => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(), 
            json: jest.fn()
        };
        next = jest.fn();
    });

    // Lista com alguns casos que devem retornar erro: nenhum campo preenchido, um dos campos não preenchido, múltiplos campos não preenchidos.
    const errorCases = [ {}, 
        { restaurantName: 'Marcus Pizza', cnpj: 123, email: 'marcus@gmail' }, { nome: 'Marcus Pizza' }];

    // Testará cada caso de erro
    test.each(errorCases)(
        'Deve retornar 400 se algum dos campos de registro não for preenchido',
        (body) => {
            req.body = body;

            validateRegisterRestaurant(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Todos os campos são obrigatórios.' });
            expect(next).not.toHaveBeenCalled();
        }
    );

    it('Deve chamar next() se todos os campos forem preenchidos', () => {
        req.body = { restaurantName: 'Marcus Pizza', cnpj: 123, email: 'marcus@gmail', password: 12345678 };

        validateRegisterRestaurant(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});

// Teste da validação de id cookie
describe('idCookieRestaurant middleware', () => {
    let req, res, next; 

    beforeEach( () => {
        req = { cookies: {}};
        res = { 
            status: jest.fn().mockReturnThis(), 
            json: jest.fn()
        };
        next = jest.fn();
    }); 

    it('Deve retornar 401 se o id não for inserido', () => {
        idCookieRestaurant(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Não autenticado.' });
        expect(next).not.toHaveBeenCalled();
    });

    it('Deve chamar next() se o id for inserido', () => {
        req.cookies = { restaurantId: 123 };

        idCookieRestaurant(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});

// Teste da validação de id query
describe('idQueryRestaurant middleware', () => {
    let req, res, next; 

    beforeEach( () => {
        req = { query: {}};
        res = { 
            status: jest.fn().mockReturnThis(), 
            json: jest.fn()
        };
        next = jest.fn();
    }); 

    it('Deve retornar 400 se o id não for inserido', () => {
        idQueryRestaurant(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'ID do restaurante é obrigatório.' });
        expect(next).not.toHaveBeenCalled();
    });

    it('Deve chamar next() se o id for inserido', () => {
        req.query = { restaurantId: 123 };

        idQueryRestaurant(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});

describe('validateSubmitReview middleware', () => {
    let req, res, next;

    beforeEach( () => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(), 
            json: jest.fn()
        };
        next = jest.fn();
    });

    // Lista de casos com campos obrigatórios ausentes
    const errorCases = [ {}, 
        { restaurantId: 123, reviewerName: 'name' }, { restaurantId: 123, rating: 6 }];

    test.each(errorCases)(
        'Deve retornar 400 se algum dos campos não for preenchido',
        (body) => {
            req.body = body;

            validateSubmitReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Restaurante, nome e nota são obrigatórios.' });
            expect(next).not.toHaveBeenCalled();
        }
    );

    it('Deve retornar 400 se os campos forem preenchidos, mas o rating for menor que 1 ou maior que 5', () => {
        req.body = { restaurantId: 123, reviewerName: 'name', rating: 6 };

        validateSubmitReview(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'A nota deve ser entre 1 e 5.' });
        expect(next).not.toHaveBeenCalled();

    });

    it('Deve chamar next() se todos os campos forem preenchidos e o rating for entre entre 1 e 5 (incluindo ambos)', () => {
        req.body = { restaurantId: 123, reviewerName: 'name', rating: 5 };

        validateSubmitReview(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});