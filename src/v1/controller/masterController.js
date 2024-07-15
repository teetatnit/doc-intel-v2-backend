const siteConfig = require('../../../config/sitConfig')
var http = require('../../../util/controllerHttp')
module.exports = {
  getMasterConfig: async (req, res, next) => {
    var result = []
    var statusCode = 200
    try {
      result = siteConfig.master.config.filter(item => delete item.url)
    } catch (error) {
      const errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = result
    next()
  },
  updateMasterData: async (req, res, next) => {
    const body = req.body
    try {
      if (typeof body.code !== 'undefined' && typeof body.full_path !== 'undefined') {
        const urlConfig = siteConfig.master.config.filter(item => item.code === body.code)
        if (urlConfig.length > 0) {
          const data = { path: body.full_path }
          try {
            const result = await http.httppost(urlConfig[0].url, data, true, true)
            res.data = result
            next()
          } catch (error) {
            const erUrlMas = {
              status: 400,
              message: 'something wrong -1004 '
            }
            next(erUrlMas)
          }
        } else {
          const erCode = {
            status: 400,
            message: 'something wrong -1003 [code not found]'
          }
          next(erCode)
        }
      } else {
        const errParam = {
          status: 400,
          message: 'something wrong -1002'
        }
        next(errParam)
      }
    } catch (error) {
      const errMsg = {
        status: 400,
        message: 'something wrong -1001'
      }
      console.log(error)
      next(errMsg)
    }
  }
}
