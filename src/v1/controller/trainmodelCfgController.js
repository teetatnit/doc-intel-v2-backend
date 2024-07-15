var trainModelCfgModel = require('../model/trainModelCfgModel')

module.exports = {
    getTrainModelCfgConnection: async (req, res, next) => {
        var model_template_id = (typeof req.params.model_template_id !== 'undefined' ? req.params.model_template_id : null)
        var errMsg = null
        var data = []
        var statusCode = 200
        try {
            var result = await trainModelCfgModel.getTrainModelCfgConnection(model_template_id)
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
    getTrainModelCfgProject: async (req, res, next) => {
        var model_template_id = (typeof req.params.model_template_id !== 'undefined' ? req.params.model_template_id : null)
        var errMsg = null
        var data = []
        var statusCode = 200
        try {
            var result = await trainModelCfgModel.getTrainModelCfgProject(model_template_id)
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
}
