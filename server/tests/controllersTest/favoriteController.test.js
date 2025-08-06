const { getFavoriteRestaurants, getFavoriteIds, toggleFavorite } = require('../../controllers/favoriteController');
const { db } = require('../../models/db');

jest.mock('../../models/db');

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('getFavoriteRestaurants controller', () => {
  let req, res;

  beforeEach(() => {
    req = { cookies: { clientId: '1' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('Deve retornar 500 em caso de erro no banco de dados', () => {
    db.all.mockImplementation((query, params, callback) => {
      callback(new Error('Erro de db'), null);
    });

    getFavoriteRestaurants(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno no servidor.' });
  });

  it('Deve retornar lista de restaurantes favoritos', () => {
    const mockRestaurants = [
      { id: '1', restaurant_name: 'Restaurante A', average_rating: 4.5, review_count: 10 },
      { id: '2', restaurant_name: 'Restaurante B', average_rating: 3.8, review_count: 5 }
    ];
    db.all.mockImplementation((query, params, callback) => {
      callback(null, mockRestaurants);
    });

    getFavoriteRestaurants(req, res);

    expect(db.all).toHaveBeenCalledWith(
      expect.any(String),
      ['1'],
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

describe('getFavoriteIds controller', () => {
  let req, res;

  beforeEach(() => {
    req = { cookies: { clientId: '1' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('Deve retornar 500 em caso de erro no banco de dados', () => {
    db.all.mockImplementation((query, params, callback) => {
      callback(new Error('Erro de db'), null);
    });

    getFavoriteIds(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno no servidor.' });
  });

  it('Deve retornar lista de IDs de restaurantes favoritos', () => {
    db.all.mockImplementation((query, params, callback) => {
      callback(null, [{ restaurant_id: '1' }, { restaurant_id: '2' }]);
    });

    getFavoriteIds(req, res);

    expect(db.all).toHaveBeenCalledWith(
      expect.any(String),
      ['1'],
      expect.any(Function)
    );
    expect(res.json).toHaveBeenCalledWith({ favorites: ['1', '2'] });
  });
});

describe('toggleFavorite controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      cookies: { clientId: '1' },
      body: { restaurantId: '2', action: 'add' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('Deve retornar 401 se clientId não está presente', async () => {
    req.cookies.clientId = undefined;

    await toggleFavorite(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Não autenticado.' });
  });

  it('Deve retornar 400 se restaurantId ou action estão ausentes', async () => {
    req.body = {};

    await toggleFavorite(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'ID do restaurante e ação são obrigatórios.' });
  });

  it('Deve retornar 201 ao adicionar restaurante aos favoritos', async () => {
    db.run.mockImplementation((query, params, callback) => {
      callback(null);
    });

    await toggleFavorite(req, res);

    expect(db.run).toHaveBeenCalledWith(
      expect.any(String),
      ['1', '2', expect.any(String)],
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Restaurante adicionado aos favoritos!' });
  });

  it('Deve retornar 200 ao remover restaurante dos favoritos', async () => {
    req.body.action = 'remove';
    db.run.mockImplementation((query, params, callback) => {
      callback(null);
    });

    await toggleFavorite(req, res);

    expect(db.run).toHaveBeenCalledWith(
      expect.any(String),
      ['1', '2'],
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Restaurante removido dos favoritos!' });
  });

  it('Deve retornar 400 para ação inválida', async () => {
    req.body.action = 'invalid';

    await toggleFavorite(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Ação inválida.' });
  });

  it('Deve retornar 500 em caso de erro no banco de dados', async () => {
    db.run.mockImplementation((query, params, callback) => {
      callback(new Error('Erro de db'));
    });

    await toggleFavorite(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno no servidor.' });
  });
});