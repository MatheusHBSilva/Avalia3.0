const { validateRegisterClient, validateGetClient } = require('../../middlewares/clientMiddlewares');

describe('validateRegisterClient middleware', () => {
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
        { nome: 'Thales', sobrenome: 'Costa', cpf: 12345678924, telefone: 99999999, email: 'thales@gmail' }, { nome: 'Thales' }];

    // Testará cada caso de erro
    test.each(errorCases)(
        'Deve retornar 400 se algum dos campos de registro não for preenchido',
        (body) => {
            req.body = body;

            validateRegisterClient(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Todos os campos obrigatórios são obrigatórios.' });
            expect(next).not.toHaveBeenCalled();
        }
    );

    it('Deve chamar next() se todos os campos forem preenchidos', () => {
        req.body = { nome: 'Thales', sobrenome: 'Costa', cpf: 12345678924, telefone: 99999999, email: 'thales@gmail', senha: 12345678 };

        validateRegisterClient(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});

describe('validateGetClient middleware', () => {
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
        validateGetClient(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Não autenticado.' });
        expect(next).not.toHaveBeenCalled();
    });

    it('Deve chamar next() se o id for inserido', () => {
        req.cookies = { clientId: 123 };

        validateGetClient(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});