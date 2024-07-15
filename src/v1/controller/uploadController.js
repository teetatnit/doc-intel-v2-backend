/*
Revisor:            Chanakan C.
Revision date:      28/Apr/2021
Revision Reason:    Fix not in a camel char
*/

var multer = require('multer')
const config = require('../../../config/sitConfig')
var fs = require('fs')
var mimeType = require('mime-types')
const crypto = require('crypto')
var storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // ***** 28/Apr/2021 Chanakan C. Mod Start ***** //
    var path = config.upload.v1.filePath
    // ***** 28/Apr/2021 Chanakan C. Mod End ***** //
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true })
    }
    cb(null, path)
  },
  filename: async (req, file, cb) => {
    crypto.randomBytes(16, async (err, buffer) => {
      if (!err) {
        var token = buffer.toString('hex')
        var ext = mimeType.extension(file.mimetype)
        cb(null, token.toString('hex') + Date.now() + '.' + ext)
      } else {
        var uploadError = {
          status: 400,
          message: err.message
        }
        req.err = uploadError
        cb(null, false)
      }
    })
  }
})
var fileFilter = async (req, file, cb) => {
  var fileType = mimeType.extension(file.mimetype)
  var extentionAllow = config.upload.v1.allow_file
  var resultAllow = extentionAllow.filter(ext => ext === fileType)
  if (resultAllow.length > 0) {
    cb(null, true)
  } else {
    var uploadError = {
      status: 400,
      message: 'file type not support'
    }
    req.err = uploadError
    cb(null, false)
  }
}

var upload = multer({
  storage: storage,
  limits: { fileSize: (1024 * 1024) * config.upload.v1.max_size },
  fileFilter: fileFilter
})

// ***** 28/Apr/2021 Chanakan C. Mod Start ***** //
var setupResult = async (req) => {
  var localpath = ''
  var fullPath = ''
  var fullPathRex = /\\/gi
  var result = {}
  if (typeof req[config.upload.v1.single.fieldname] !== 'undefined') {
    localpath = req[config.upload.v1.single.fieldname].destination
    fullPath = config.upload.v1.projectPath + '\\' + req[config.upload.v1.single.fieldname].path
    fullPath = fullPath.replace(fullPathRex, '/').replace(config.upload.v1.filePath, '/')
    Object.assign(result, { original_name: req[config.upload.v1.single.fieldname].originalname, localpath: localpath, fullPath: fullPath, mimetype: req[config.upload.v1.single.fieldname].mimetype, ext: mimeType.extension(req[config.upload.v1.single.fieldname].mimetype) })
    return result
  } else {
    return false
  }
}
// ***** 28/Apr/2021 Chanakan C. Mod End ***** //

module.exports = {
  singleFile: upload.single(config.upload.v1.single.fieldname),
  responseFileUpload: async (req, res, next) => {
    if (!req.err) {
      var data = await setupResult(req)
      if (data === false) {
        var errResult = {
          status: 400,
          message: 'something wrong'
        }
        next(errResult)
      } else {
        res.statusCode = 200
        res.data = data
        next()
      }
    } else {
      next(req.err)
    }
  }
}
