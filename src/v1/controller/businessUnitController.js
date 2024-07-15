var businessUnitModel = require('../model/businessUnitModel')
module.exports = {
  getBusinessunitRaw: async (req, res, next) => {
    var errMsg = null
    try {
      var result = await businessUnitModel.getBusinessunitRaw()
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
  },
  getBusinessUnit: async (req, res, next) => {
    var errMsg = null
    try {
      var result = await businessUnitModel.getBusinessUnit('Y', 'asc')
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
  },
  updateBusinessUnit: async (req, res, next) => {
    var errMsg = null
    try {
      var businessUnitCode = (typeof req.params.business_unit_code !== 'undefined' ? req.params.business_unit_code : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Upload Fail' }
      var statusCode = 200
      var checkBusinessUnit = await businessUnitModel.checkBusinessUnitByCode(businessUnitCode, 'Y')
      if (checkBusinessUnit.recordsets[0].length > 0) {
        if (checkBusinessUnit.recordset[0].count > 0) {
          var companyUpdate = await businessUnitModel.updateBusinessUnit(businessUnitCode, reqBody.business_unit_name, reqBody.update_by)
          if (companyUpdate !== null && companyUpdate.rowsAffected.length > 0) {
            data = { status: 'success', message: 'Update Success' }
          } else {
            data = { status: 'fail', message: 'Update Fail' }
          }
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
  insertBusinessUnit: async (req, res, next) => {
    var errMsg = null
    try {
      var reqBody = req.body
      var data = { status: 'fail', message: 'Upload Fail' }
      var statusCode = 200
      var checkBusinessUnit = await businessUnitModel.checkBusinessUnitByCode(reqBody.business_unit_code, 'Y')
      if (checkBusinessUnit.recordsets[0].length > 0) {
        if (checkBusinessUnit.recordset[0].count === 0) {
          var companyCreate = await businessUnitModel.insertBusinessUnit(reqBody.business_unit_code, reqBody.business_unit_name, reqBody.create_by)
          if (companyCreate !== null && companyCreate.rowsAffected.length > 0) {
            data = { status: 'success', message: 'Create Success' }
          } else {
            data = { status: 'fail', message: 'Create Fail' }
          }
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
  deleteBusinessUnit: async (req, res, next) => {
    var errMsg = null
    try {
      var businessUnitCode = (typeof req.params.business_unit_code !== 'undefined' ? req.params.business_unit_code : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Delete Fail' }
      var statusCode = 200
      if (businessUnitCode !== null) {
        var masterDataUpdate = await businessUnitModel.deleteBusinessUnitByBusinessUnitCode(businessUnitCode, reqBody.is_active, reqBody.update_by)
        if (typeof masterDataUpdate.rowsAffected !== 'undefined' && masterDataUpdate.rowsAffected.length > 0) {
          data = { status: 'success', message: 'Delete Success' }
        } else {
          data = { status: 'fail', message: 'Delete Fail' }
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