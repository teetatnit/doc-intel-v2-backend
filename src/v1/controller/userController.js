var userModel = require('../model/userModel')
module.exports = {
  getUserProfile: async (req, res, next) => {
    var errMsg = null
    try {
      var reqEmail = (typeof req.params.email !== 'undefined' ? req.params.email : null)
      var email = await userModel.getUserRole(reqEmail, 'Y', 'asc')
      var data = []
      var statusCode = 200
      if (email.recordsets[0].length > 0) {
        data = email.recordsets[0]
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
  upsertUserProfile: async (req, res, next) => {
    var errMsg = null
    try {
      var reqUserId = (typeof req.params.user_id !== 'undefined' ? req.params.user_id : null)
      var reqBody = req.body
      var data = { status: 'success', message: 'update success' }
      var statusCode = 200
      if (reqUserId !== null) {
        // update user role
        var userUpdate = await userModel.updateRole(reqUserId, reqBody.role, reqBody.update_by)
        if (typeof userUpdate.rowsAffected !== 'undefined' && userUpdate.rowsAffected.length > 0) {
          data = { status: 'success', message: 'update success' }
        } else {
          data = { status: 'fail', message: 'update fail' }
        }
      } else {

        var checkUser = await userModel.checkUserByEmailCompanyDivision(reqBody.email, reqBody.company_code, reqBody.division_code, 'Y')
        if (checkUser.recordsets[0].length > 0) {
          if (checkUser.recordset[0].count === 0) {     
            // create user and role
            var userCreate = await userModel.createUser(reqBody.email, reqBody.name, reqBody.company_code, reqBody.division_code, reqBody.role, reqBody.create_by)
            if (userCreate !== null && userCreate.rowsAffected.length > 0) {
              data = { status: 'success', message: 'create success' }
            } else {
              data = { status: 'fail', message: 'create fail' }
            }
          } else {
            data = { status: 'fail', message: 'create fail duplicate user' } 
          }     
        } else {
          data = { status: 'fail', message: 'create fail' }
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
  deleteUserProfile: async (req, res, next) => {
    var errMsg = null
    try {
      var reqUserId = (typeof req.params.user_id !== 'undefined' ? req.params.user_id : null)
      var reqBody = req.body
      var data = { status: 'success', message: 'update success' }
      var statusCode = 200
      if (reqUserId !== null) {
        var userUpdate = await userModel.deleteUserByUserId(reqUserId, reqBody.is_active, reqBody.update_by)
        if (typeof userUpdate.rowsAffected !== 'undefined' && userUpdate.rowsAffected.length > 0) {
          data = { status: 'success', message: 'update success' }
        } else {
          data = { status: 'fail', message: 'update fail' }
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
  }
}
