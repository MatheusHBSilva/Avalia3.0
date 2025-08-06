function validateReportId(req, res, next) {
    const { reportId } = req.body;

    if (!reportId) {
        return res
        .status(400)
        .json({ error: 'ID do relatório é obrigatório.' });
    }

    next();
}

module.exports = validateReportId;