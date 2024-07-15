var trainModelModel = require('../model/trainModelModel')

module.exports = {
  getTrainModelByModelTemplateId: async (req, res, next) => {
    var model_template_id = (typeof req.params.model_template_id !== 'undefined' ? req.params.model_template_id : null)
    var errMsg = null
    var data = []
    var statusCode = 200
    try {
      var result = await trainModelModel.getTrainModelByModelTemplateId(model_template_id)
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
  getTrainModelDefaultByMasterDataId: async (req, res, next) => {
    var masterdata_id = (typeof req.params.masterdata_id !== 'undefined' ? req.params.masterdata_id : null)
    var errMsg = null
    var data = []
    var statusCode = 200
    try {
      var result = await trainModelModel.getTrainModelDefaultByMasterDataId(masterdata_id)
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
      var data = { status: 'fail', message: 'Insert Train model Fail' }
      var statusCode = 200
      var is_default = 0
      var trainModelByModelTemplateId = await trainModelModel.getTrainModelByModelTemplateId(reqBody.model_template_id)
      if (trainModelByModelTemplateId.recordsets[0].length === 0) {
        is_default = 1;
      }
      var trainModelCreate = await trainModelModel.insertTrainModel(reqBody.model_template_id, reqBody.name, reqBody.model_number, reqBody.create_datetime, reqBody.update_datetime, reqBody.status, reqBody.average_model_accuracy, reqBody.total_pages_train,is_default)
      if (trainModelCreate !== null && trainModelCreate.rowsAffected.length > 0) {
        data = { status: 'success', message: 'Insert Model Success', recordset: trainModelCreate.recordset }
      } else {
        data = { status: 'fail', message: 'Update Model Fail' }
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
  updateTrainModelSetIsDefault: async (req, res, next) => {
    var model_id = (typeof req.params.model_id !== 'undefined' ? req.params.model_id : null)
    var model_template_id = (typeof req.body.model_template_id !== 'undefined' ? req.body.model_template_id : null)
    var errMsg = null
    try {
      var data = { status: 'fail', message: 'Insert Train model Fail' }
      var statusCode = 200
      var trainModelCreate = await trainModelModel.updateTrainModelSetIsDefault(model_id, model_template_id)
      if (trainModelCreate !== null && trainModelCreate.rowsAffected.length > 0) {
        data = { status: 'success', message: 'Update Model Success' }
      } else {
        data = { status: 'fail', message: 'Update Model Fail' }
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
