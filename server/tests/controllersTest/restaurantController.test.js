const { registerRestaurant, getCurrentRestaurant, getRestaurants, getRestaurantTags } = require('../../controllers/restaurantController');
const { db } = require('../../models/db');
const bcrypt = require('bcrypt');

jest.mock('../../models/db');
jest.mock('bcrypt');

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('registerRestaurant controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        restaurantName: 'Restaurante Teste',
        cnpj: '12345678000195',
        email: 'teste@restaurante.com',
        password: '123',
        tags: 'vegano, italiano'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('Deve retornar 400 se o email já está registrado', async () => {
    db.get.mockImplementation((query, params, callback) => {
      callback(null, { email: 'teste@restaurante.com' });
    });

    await registerRestaurant(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Este email já está registrado.' });
  });

  it('Deve retornar 201 quando o registro é salvo com sucesso', async () => {
    db.get.mockImplementation((query, params, callback) => {
      callback(null, null);
    });
    bcrypt.hash.mockResolvedValue('senha-falsa');
    db.run.mockImplementation((query, params, callback) => {
      callback(null);
    });

    await registerRestaurant(req, res);

    expect(db.get).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalledWith('123', 10);
    expect(db.run).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Registro salvo com sucesso!' });
  });

  it('Deve retornar 500 em caso de erro no banco de dados', async () => {
    db.get.mockImplementation((query, params, callback) => {
      callback(new Error('Erro de db'), null);
    });

    await registerRestaurant(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno no servidor.' });
  });
});

describe('getCurrentRestaurant controller', () => {
  let req, res;

  beforeEach(() => {
    req = { cookies: { restaurantId: '1' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('Deve retornar 500 em caso de erro no banco de dados', () => {
    db.get.mockImplementation((query, params, callback) => {
      callback(new Error('Erro de db'), null);
    });

    getCurrentRestaurant(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno no servidor.' });
  });

  it('Deve retornar 404 se o restaurante não for encontrado', () => {
    db.get.mockImplementation((query, params, callback) => {
      callback(null, null);
    });

    getCurrentRestaurant(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Restaurante não encontrado.' });
  });

  it('Deve retornar os dados do restaurante com tags formatadas', () => {
    db.get.mockImplementation((query, params, callback) => {
      callback(null, { id: '1', restaurant_name: 'Restaurante Teste', tags: 'vegano, italiano' });
    });

    getCurrentRestaurant(req, res);

    expect(res.json).toHaveBeenCalledWith({
      restaurantId: '1',
      restaurantName: 'Restaurante Teste',
      tags: ['vegano', 'italiano']
    });
  });
});

describe('getRestaurants controller', () => {
  let req, res;

  beforeEach(() => {
    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('Deve retornar 500 em caso de erro no banco de dados', () => {
    db.all.mockImplementation((query, params, callback) => {
      callback(new Error('Erro de db'), null);
    });

    getRestaurants(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno no servidor.' });
  });

  it('Deve retornar 404 quando id é fornecido mas restaurante não encontrado', () => {
    req.query.id = '1';
    db.all.mockImplementation((query, params, callback) => {
      callback(null, []);
    });

    getRestaurants(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Restaurante não encontrado.' });
  });

  it('Deve retornar restaurantes com média de avaliações', () => {
    req.query.limit = '2';
    db.all.mockImplementation((query, params, callback) => {
      callback(null, [
        { id: '1', restaurant_name: 'Restaurante A', average_rating: 4.5, review_count: 10 },
        { id: '2', restaurant_name: 'Restaurante B', average_rating: 3.8, review_count: 5 }
      ]);
    });

    getRestaurants(req, res);

    expect(db.all).toHaveBeenCalledWith(
      expect.any(String),
      [2],
      expect.any(Function)
    );
    expect(res.json).toHaveBeenCalledWith({
      restaurants: [
        { id: '1', restaurant_name: 'Restaurante A', average_rating: 4.5, review_count: 10 },
        { id: '2', restaurant_name: 'Restaurante B', average_rating: 3.8, review_count: 5 }
      ]
    });
  });
});

describe('getRestaurantTags controller', () => {
  let req, res;

  beforeEach(() => {
    req = { query: { id: '1' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('Deve retornar 500 em caso de erro no banco de dados', () => {
    db.get.mockImplementation((query, params, callback) => {
      callback(new Error('Erro de db'), null);
    });

    getRestaurantTags(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno no servidor.' });
  });

  it('Deve retornar 404 se o restaurante não for encontrado', () => {
    db.get.mockImplementation((query, params, callback) => {
      callback(null, null);
    });

    getRestaurantTags(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Restaurante não encontrado.' });
  });

  it('Deve retornar as tags do restaurante', () => {
    db.get.mockImplementation((query, params, callback) => {
      callback(null, { tags: 'vegano, italiano' });
    });

    getRestaurantTags(req, res);

    expect(res.json).toHaveBeenCalledWith({ tags: ['vegano', 'italiano'] });
  });
});