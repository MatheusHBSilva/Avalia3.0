const { clientRecommendation } = require('../../controllers/recommendationController');
const { db } = require('../../models/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const PDFDocument = require('pdfkit');

jest.mock('../../models/db');
jest.mock('@google/generative-ai');
jest.mock('pdfkit');

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('clientRecommendation controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      cookies: { clientId: '1' },
      body: { restaurantId: '2', format: 'json' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      send: jest.fn()
    };
  });

  it('Deve retornar 500 se a chave da API do Gemini não está configurada', async () => {
    // Ensure process.env.GEMINI_API_KEY is undefined
    expect(process.env.GEMINI_API_KEY).toBeUndefined();

    // Mock db.all to return immediately
    db.all.mockImplementation((query, params, callback) => {
      callback(null, []);
    });

    // Mock db.get for restaurant and client tags
    db.get
      .mockImplementationOnce((query, params, callback) => {
        callback(null, { tags: 'vegano, italiano' });
      })
      .mockImplementationOnce((query, params, callback) => {
        callback(null, { tags: 'vegano' });
      });

    // Ensure GoogleGenerativeAI is not called
    GoogleGenerativeAI.mockImplementation(() => {
      throw new Error('GoogleGenerativeAI não deveria ser chamado');
    });

    await clientRecommendation(req, res);

    expect(GoogleGenerativeAI).not.toHaveBeenCalled();
    expect(db.all).toHaveBeenCalledWith(
      expect.any(String),
      ['2'],
      expect.any(Function)
    );
    expect(db.get).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Chave da API do Gemini não configurada no .env.'
    });
  }, 10000); 
  

  it('Deve retornar 500 em caso de erro no banco de dados ao buscar avaliações', async () => {
    process.env.GEMINI_API_KEY = 'fake-key';
    db.all.mockImplementation((query, params, callback) => {
      callback(new Error('Erro de db'), null);
    });

    await clientRecommendation(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro de db' });
  });

  it('Deve retornar recomendação em JSON com sucesso', async () => {
    process.env.GEMINI_API_KEY = 'fake-key';
    db.all.mockImplementation((query, params, callback) => {
      console.log('db.all called with query:', query, 'params:', params);
      callback(null, [{ reviewer_name: 'João', rating: 4, review_text: 'Ótimo!' }]);
    });
    db.get
      .mockImplementationOnce((query, params, callback) => {
        console.log('db.get called (restaurant):', query, 'params:', params);
        callback(null, { tags: 'vegano, italiano' });
      })
      .mockImplementationOnce((query, params, callback) => {
        console.log('db.get called (client):', query, 'params:', params);
        callback(null, { tags: 'vegano' });
      })
      .mockImplementation((query, params, callback) => {
        console.log('Unexpected db.get called:', query, 'params:', params);
        callback(null, null); // Handle unexpected calls gracefully
      });
    const mockModel = {
      generateContent: jest.fn().mockResolvedValue({
        response: { text: jest.fn().mockResolvedValue('Recomendação mockada') }
      })
    };
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue(mockModel)
    }));

    await clientRecommendation(req, res);

    expect(db.all).toHaveBeenCalled();
    expect(db.get).toHaveBeenCalledTimes(4);
    expect(res.json).toHaveBeenCalledWith({ analysis: 'Recomendação mockada' });
  });
});