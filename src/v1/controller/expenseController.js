/*
Creator:            Apiwat Emem
Creation date:      06/05/2021
*/

var expenseModel = require('../model/expenseModel')
module.exports = {
  getExpenseRaw: async (req, res, next) => {
    var errMsg = null
    try {
      var result = await expenseModel.getExpenseRaw()
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
  getExpense: async (req, res, next) => {
    var code = (typeof req.params.code !== 'undefined' ? req.params.code : null)
    var errMsg = null
    try {
      var result = await expenseModel.getExpense(code, "Y", "ASC" )
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
  updateExpense: async (req, res, next) => {
    var errMsg = null
    try {
      var expenseCode = (typeof req.params.expense_code !== 'undefined' ? req.params.expense_code : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Upload Fail' }
      var statusCode = 200
      var checkExpense = await expenseModel.checkExpenseByCode(expenseCode)
      if (checkExpense.recordsets[0].length > 0) {
        if (checkExpense.recordset[0].count > 0) {
          var expenseUpdate = await expenseModel.updateExpense(expenseCode, reqBody.name, reqBody.update_by)
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
  insertExpense: async (req, res, next) => {
    var errMsg = null
    try {
      var reqBody = req.body
      var data = { status: 'fail', message: 'Upload Fail' }
      var statusCode = 200
      var checkExpense = await expenseModel.checkExpenseByCode(reqBody.code)
      if (checkExpense.recordsets[0].length > 0) {
        if (checkExpense.recordset[0].count === 0) {
          var expenseCreate = await expenseModel.insertExpense(reqBody.code, reqBody.name, reqBody.create_by)
          if (expenseCreate !== null && expenseCreate.rowsAffected.length > 0) {
            data = { status: 'success', message: 'Create Success' }
          } else {
            data = { status: 'fail', message: 'Create Fail' }
          }
        }else{
          data = { status: 'fail', message: 'Create Fail, Duplicate expense code' }
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
  deleteExpense: async (req, res, next) => {
    var errMsg = null
    try {
      var expenseCode = (typeof req.params.expense_code !== 'undefined' ? req.params.expense_code : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Delete Fail' }
      var statusCode = 200
      if (expenseCode !== null) {
        var expenseDelete = await expenseModel.deleteExpenseByExpenseCode(expenseCode, reqBody.is_active, reqBody.update_by)
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