const { businessAnalysis } = require('../../controllers/analysisController');
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

describe('businessAnalysis controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { restaurantId: '1', format: 'json' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      send: jest.fn()
    };
  });

  it('Deve retornar 500 se a chave da API do Gemini não está configurada', async () => {
    // Garante que process.env.GEMINI_API_KEY seja undefined
    expect(process.env.GEMINI_API_KEY).toBeUndefined();

    // Mock db.all para retornar imediatamente
    db.all.mockImplementation((query, params, callback) => {
      callback(null, []);
    });

    // Mock db.run para evitar erro na inserção do relatório
    db.run.mockImplementation((query, params, callback) => {
      callback(null);
    });

    // Garantir que GoogleGenerativeAI não seja chamado
    GoogleGenerativeAI.mockImplementation(() => {
      throw new Error('GoogleGenerativeAI não deveria ser chamado');
    });

    await businessAnalysis(req, res);

    expect(GoogleGenerativeAI).not.toHaveBeenCalled();
    expect(db.all).toHaveBeenCalledWith(
      expect.any(String),
      ['1'],
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Chave da API do Gemini não configurada no .env.'
    });
  }, 10000);

  it('Deve retornar 500 em caso de erro no banco de dados', async () => {
    process.env.GEMINI_API_KEY = 'fake-key';
    db.all.mockImplementation((query, params, callback) => {
      callback(new Error('Erro de db'), null);
    });

    await businessAnalysis(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro de db' });
  });


  it('Deve retornar análise em JSON com sucesso', async () => {
    process.env.GEMINI_API_KEY = 'fake-key';
    db.all.mockImplementation((query, params, callback) => {
      callback(null, [{ reviewer_name: 'João', rating: 4, review_text: 'Ótimo!', created_at: '2025-07-07T10:00:00Z' }]);
    });
    db.run.mockImplementation((query, params, callback) => {
      callback(null);
    });
    const mockModel = { generateContent: jest.fn().mockResolvedValue({ response: { text: jest.fn().mockResolvedValue('Análise mockada') } }) };
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue(mockModel)
    }));

    await businessAnalysis(req, res);

    expect(db.all).toHaveBeenCalled();
    expect(db.run).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ analysis: 'Análise mockada' });
  });
});