var favoriteModel = require('../model/favoriteModel')

module.exports = {
  getFavorite: async (req, res, next) => {
    var errMsg = null
    try {
      var favorite_id = (typeof req.params.favorite_id !== 'undefined' ? req.params.favorite_id : null)
      var favoriteData = await favoriteModel.getFavorite(favorite_id, 'Y', sort)
      var data = []
      var statusCode = 200
      if (favoriteData.recordsets[0].length > 0) {
        data = favoriteData.recordsets[0]
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
  upsertMasterData: async (req, res, next) => {
    var errMsg = null
    try {
      var masterdata_id = (typeof req.params.masterdata_id !== 'undefined' ? req.params.masterdata_id : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Update Favorite Fail' }
      var statusCode = 200
      if (masterdata_id !== null) {
        var favoriteCreate = await favoriteModel.upsertFavorite(masterdata_id, reqBody.is_active, reqBody.favorite_by)
        if (favoriteCreate !== null && favoriteCreate.rowsAffected.length > 0) {
          data = { status: 'success', message: 'Update Favorite Success' }
        } else {
          data = { status: 'fail', message: 'Update Favorite Fail' }
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
