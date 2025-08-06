const { registerClient, getCurrentClient } = require('../../controllers/clientController');
const { db } = require('../../models/db');
const bcrypt = require('bcrypt');

jest.mock('../../models/db');
jest.mock('bcrypt');

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

// Teste da função getCurrentClient
describe('getCurrentClient controller', () => {
    let req, res;

    beforeEach( () => {
        req = { cookies: { clientId: 123 } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it('Deve retornar 500 caso aconteça algum erro no banco de dados', () => {
        db.get.mockImplementation((query, params, callback) => {
            callback(new Error('Erro de db'), null);
        });

        getCurrentClient(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno no servidor.' });
    });

    it('Deve retornar 404 caso o cliente não seja encontrado', () => {
        db.get.mockImplementation((query, params, callback) => {
            callback(null, null);
        });

        getCurrentClient(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Cliente não encontrado.' });
    });

    it('Deve retornar os dados formatados caso o cliente seja encontrado', () => {
        db.get.mockImplementation((query, params, callback) => {
            callback(null, { id: 123, nome: 'João', sobrenome: 'Pedro', email: 'joao@gmail', tags: 'vegano, leal' });
        });

        getCurrentClient(req, res);

        expect(res.json).toHaveBeenCalledWith({ clientId: 123, nome: 'João', sobrenome: 'Pedro', email: 'joao@gmail', tags: ['vegano', 'leal'] });
    });
});

// Teste da função registerClient
describe('registerClient controller', () => {
    let req, res;

    beforeEach( () => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it('Retorna 400 se o email e senha já estiverem registrados', async () => {
        db.get.mockImplementation((query, params, callback) => {
            callback(null, { email: 'joao@gmail' });
        });

        await registerClient(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Este email ou CPF já está registrado.' });
    });

    it('Retorna 201 caso o cadastro tenha sido feito com sucesso', async () => {
        req.body = { nome: 'João', sobrenome: 'Pedro', cpf: 12345678, telefone: 99999999, email: 'joao@gmail', senha: '123', tags: 'vegano, leal' };

        db.get.mockImplementation((query, params, callback) => {
            callback(null, null);
        });
        bcrypt.hash.mockResolvedValue('senha-falsa');
        db.run.mockImplementation((query, params, callback) => {
            callback(null);
        });

        await registerClient(req, res);

        expect(db.get).toHaveBeenCalled();
        expect(bcrypt.hash).toHaveBeenCalledWith('123', 10);
        expect(db.run).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: 'Cadastro salvo com sucesso!' });
    });

    it('Deve retornar 500 caso aconteça algum erro no banco de dados', async () => {
        db.get.mockImplementation((query, params, callback) => {
            callback(new Error('Erro de db'), null);
        });

        await registerClient(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno no servidor.' });
    });
});
