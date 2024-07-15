var documentModel = require('../model/documentModel')
module.exports = {
  getDocument: async (req, res, next) => {
    var reqDocumentCode = (typeof req.params.document_code !== 'undefined' ? req.params.document_code : null)
    var errMsg = null
    try {
      var result = await documentModel.getDocument(reqDocumentCode, 'asc', 'Y')
      var data = []
      var statusCode = 200
      if (result.recordsets[0].length > 0) {
        data = result.recordsets[0]
      }
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = data
    next()
  }
}
