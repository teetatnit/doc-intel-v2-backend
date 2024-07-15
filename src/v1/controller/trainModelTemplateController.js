var trainModelTemplateModel = require('../model/trainModelTemplateModel')
var masterDataModel = require('../model/masterDataModel')
module.exports = {
  getTrainModel: async (req, res, next) => {
    var email = (typeof req.query.email !== 'undefined' ? req.query.email : '')
    var errMsg = null
    var data = []
    var statusCode = 200
    try {
      var result = await trainModelTemplateModel.getTrainModel(email)
      if (result.recordsets[0].length > 0) {
        data = result.recordsets[0];
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
  },
  getTrainModelById: async (req, res, next) => {
    var model_id = (typeof req.params.model_id !== 'undefined' ? req.params.model_id : null)
    var errMsg = null
    var data = []
    var statusCode = 200
    try {
      var result = await trainModelTemplateModel.getTrainModelById(model_id)
      if (result.recordsets[0].length > 0) {
        data = result.recordsets[0];
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
  },
  insertTrainModel: async (req, res, next) => {
    var errMsg = null
    try {
      var reqBody = req.body
      var data = { status: 'fail', message: 'Update Favorite Fail' }
      var statusCode = 200
      var status = "in-progress"

      var resultModel = await trainModelTemplateModel.getTrainModelByMasterDataId(reqBody.masterdata_id)
      if (resultModel.recordsets[0].length > 0) {
        data = { status: 'duplicate_masterdata_id', message: 'Duplicate masterdata id' }
      } else {
        var trainModelCreate = await trainModelTemplateModel.insertTrainModel(reqBody.document_code, reqBody.vendor_code, reqBody.masterdata_id, reqBody.display_name, reqBody.description, status)
        if (trainModelCreate !== null && trainModelCreate.recordset.length > 0) {
          var masterDataUpdate = await masterDataModel.updateMasterDataModelTemplateId(reqBody.masterdata_id, trainModelCreate.recordset[0].model_template_id)
          if (masterDataUpdate !== null && masterDataUpdate.rowsAffected.length > 0) {
            data = { status: 'success', message: 'Insert Model Success', recordset: trainModelCreate.recordset }
          } else {
            data = { status: 'fail', message: 'Update master data Fail' }
          }
        } else {
          data = { status: 'fail', message: 'Update Model Fail' }
        }
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
  },
}
