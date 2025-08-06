const { getReportHistory, downloadReport } = require('../../controllers/reportController');
const { db } = require('../../models/db');
const PDFDocument = require('pdfkit');

jest.mock('../../models/db');
jest.mock('pdfkit');

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('getReportHistory controller', () => {
  let req, res;

  beforeEach(() => {
    req = { query: { restaurantId: '1' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('Deve retornar 500 em caso de erro no banco de dados', () => {
    db.all.mockImplementation((query, params, callback) => {
      callback(new Error('Erro de db'), null);
    });

    getReportHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno no servidor.' });
  });

  it('Deve retornar histórico de relatórios', () => {
    const mockReports = [
      { id: '1', date: '2025-07-07T10:00:00Z' },
      { id: '2', date: '2025-07-06T10:00:00Z' }
    ];
    db.all.mockImplementation((query, params, callback) => {
      callback(null, mockReports);
    });

    getReportHistory(req, res);

    expect(db.all).toHaveBeenCalledWith(
      expect.any(String),
      ['1'],
      expect.any(Function)
    );
    expect(res.json).toHaveBeenCalledWith({ reports: mockReports });
  });
});

describe('downloadReport controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: { reportId: '1' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      send: jest.fn()
    };
  });

  it('Deve retornar 500 em caso de erro no banco de dados', async () => {
    db.get.mockImplementation((query, params, callback) => {
      callback(new Error('Erro de db'), null);
    });

    await downloadReport(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno ao baixar relatório.' });
  });

  it('Deve retornar 404 se o relatório não for encontrado', async () => {
    db.get.mockImplementation((query, params, callback) => {
      callback(null, null);
    });

    await downloadReport(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Relatório não encontrado.' });
  });

});