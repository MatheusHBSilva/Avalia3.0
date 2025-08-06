const { getReviews, submitReview } = require('../../controllers/reviewController');
const { db } = require('../../models/db');

jest.mock('../../models/db');

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('getReviews controller', () => {
  let req, res;

  beforeEach(() => {
    req = { query: { restaurantId: '1', limit: '10' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('Deve retornar 500 caso aconteça algum erro no banco de dados', () => {
    db.all.mockImplementation((query, params, callback) => {
      callback(new Error('Erro de db'), null);
    });

    getReviews(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno no servidor.' });
  });

  it('Deve retornar as avaliações com limite padrão ou personalizado', () => {
    const mockReviews = [
      { reviewer_name: 'João', rating: 4, review_text: 'Ótimo!', created_at: '2025-07-07T10:00:00Z' },
      { reviewer_name: 'Maria', rating: 5, review_text: 'Excelente!', created_at: '2025-07-06T10:00:00Z' }
    ];
    db.all.mockImplementation((query, params, callback) => {
      callback(null, mockReviews);
    });

    getReviews(req, res);

    expect(db.all).toHaveBeenCalledWith(
      expect.any(String),
      ['1', 10],
      expect.any(Function)
    );
    expect(res.json).toHaveBeenCalledWith({ reviews: mockReviews });
  });

  it('Deve usar limite padrão de 50 quando não especificado', () => {
    req.query.limit = undefined;
    db.all.mockImplementation((query, params, callback) => {
      callback(null, []);
    });

    getReviews(req, res);

    expect(db.all).toHaveBeenCalledWith(
      expect.any(String),
      ['1', 50],
      expect.any(Function)
    );
    expect(res.json).toHaveBeenCalledWith({ reviews: [] });
  });
});

describe('submitReview controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        restaurantId: '1',
        reviewerName: 'João',
        rating: 4,
        reviewText: 'Ótima experiência!'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('Deve retornar 500 caso aconteça algum erro no banco de dados', async () => {
    db.run.mockImplementation((query, params, callback) => {
      callback(new Error('Erro de db'));
    });

    await submitReview(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno no servidor.' });
  });

  it('Deve retornar 201 quando a avaliação é salva com sucesso', async () => {
    db.run.mockImplementation((query, params, callback) => {
      callback(null);
    });

    await submitReview(req, res);

    expect(db.run).toHaveBeenCalledWith(
      expect.any(String),
      ['1', 'João', 4, 'Ótima experiência!', expect.any(String)],
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Avaliação salva com sucesso!' });
  });

  it('Deve salvar com reviewText vazio quando não fornecido', async () => {
    req.body.reviewText = undefined;
    db.run.mockImplementation((query, params, callback) => {
      callback(null);
    });

    await submitReview(req, res);

    expect(db.run).toHaveBeenCalledWith(
      expect.any(String),
      ['1', 'João', 4, '', expect.any(String)],
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Avaliação salva com sucesso!' });
  });
});