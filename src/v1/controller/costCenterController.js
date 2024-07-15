/*
Creator:            Apiwat Emem
Creation date:      06/05/2021
*/

var costCenterModel = require('../model/costCenterModel')
module.exports = {
  getCostCenterRaw: async (req, res, next) => {
    var errMsg = null
    try {
      var result = await costCenterModel.getCostCenterRaw()
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
  getCostCenter: async (req, res, next) => {
    var code = (typeof req.params.code !== 'undefined' ? req.params.code : null)
    var errMsg = null
    try {
      var result = await costCenterModel.getCostCenter(code, 'Y', 'ASC')
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
  updateCostCenter: async (req, res, next) => {
    var errMsg = null
    try {
      var costcenterCode = (typeof req.params.costcenter_code !== 'undefined' ? req.params.costcenter_code : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Upload Fail' }
      var statusCode = 200
      var checkCostcenter = await costCenterModel.checkCostCenterByCode(costcenterCode)
      if (checkCostcenter.recordsets[0].length > 0) {
        if (checkCostcenter.recordset[0].count > 0) {
          var expenseUpdate = await costCenterModel.updateCostCenter(costcenterCode, reqBody.name, reqBody.update_by)
          if (expenseUpdate !== null && expenseUpdate.rowsAffected.length > 0) {
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
  insertCostCenter: async (req, res, next) => {
    
    var errMsg = null
    try {
      var reqBody = req.body
      var data = { status: 'fail', message: 'Upload Fail' }
      var statusCode = 200
      var checkCostcenter = await costCenterModel.checkCostCenterByCode(reqBody.code)
      if (checkCostcenter.recordsets[0].length > 0) {
        if (checkCostcenter.recordset[0].count === 0) {
          var expenseCreate = await costCenterModel.insertCostCenter(reqBody.code, reqBody.name, reqBody.create_by)
          if (expenseCreate !== null && expenseCreate.rowsAffected.length > 0) {
            data = { status: 'success', message: 'Create Success' }
          } else {
            data = { status: 'fail', message: 'Create Fail' }
          }
        }else{
          data = { status: 'fail', message: 'Create Fail, Duplicate cost center code' }
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
  deleteCostCenter: async (req, res, next) => {
    var errMsg = null
    try {
      var costcenterCode = (typeof req.params.costcenter_code !== 'undefined' ? req.params.costcenter_code : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Delete Fail' }
      var statusCode = 200
      if (costcenterCode !== null) {
        var expenseDelete = await costCenterModel.deleteCostCenterByCostCenterCode(costcenterCode, reqBody.is_active, reqBody.update_by)
        if (typeof expenseDelete.rowsAffected !== 'undefined' && expenseDelete.rowsAffected.length > 0) {
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