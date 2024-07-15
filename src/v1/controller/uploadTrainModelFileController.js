/*
Revisor:            Kittichai R.
Revision date:      03/Nov/2021
*/

var multer = require('multer')
const config = require('../../../config/sitConfig')
var fs = require('fs')
var mimeType = require('mime-types')
const crypto = require('crypto')

var trainModelTemplateModel = require('../model/trainModelTemplateModel')

var storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const folderName = req.dataModelTemplate.display_name
    var path = config.trainModelFile.local.filePath + folderName
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
  var extentionAllow = config.trainModelFile.local.allow_file
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
  limits: { fileSize: (1024 * 1024) * config.trainModelFile.local.max_size },
  fileFilter: fileFilter
})

var setupResult = async (req) => {
  const folderName = req.dataModelTemplate.display_name
  var path = config.trainModelFile.local.filePath + folderName
  var localpath = ''
  var fullPath = ''
  var fullPathRex = /\\/gi
  var result = {}
  if (typeof req[config.trainModelFile.local.single.fieldname] !== 'undefined') {
    localpath = req[config.trainModelFile.local.single.fieldname].destination
    fullPath = config.trainModelFile.local.projectPath + '\\' + req[config.trainModelFile.local.single.fieldname].path
    fullPath = fullPath.replace(fullPathRex, '/').replace(path, '/')
    Object.assign(result, { original_name: req[config.trainModelFile.local.single.fieldname].originalname, localpath: localpath, fullPath: fullPath, mimetype: req[config.trainModelFile.local.single.fieldname].mimetype, ext: mimeType.extension(req[config.trainModelFile.local.single.fieldname].mimetype) })
    return result
  } else {
    return false
  }
}

module.exports = {
  singleFile: upload.single(config.trainModelFile.local.single.fieldname),
  getDataModelTemplate: async (req, res, next) => {
    if (!req.err) {
      var model_template_id = (typeof req.params.model_template_id !== 'undefined' ? req.params.model_template_id : null)
      var result = await trainModelTemplateModel.getTrainModelById(model_template_id)
      if (!result.recordsets.length) {
        var errResult = {
          status: 400,
          message: 'something wrong'
        }
        next(errResult)
      } else {
        req.dataModelTemplate = result.recordsets[0][0]
        next()
      }
    } else {
      next(req.err)
    }
  },
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
