/*
Creator:            Kittichai R
Creation date:      03/11/2021
*/

const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
    getTrainModelCfgConnection: async (model_template_id) => {
        var result = false
        try {
            var pool = await sql.connect(config.sqlConn)
            // var queryString = `SELECT 
            //                       'Connection name demo' as [display_name],
            //                       'Connection description demo' as [description],
            //                       'Azure blob container' as [provider],
            //                       'https://chemtechdevdistorage.blob.core.windows.net/traindoc?sp=racwdli&st=2021-11-02T08:45:08Z&se=2021-12-31T16:45:08Z&spr=https&sv=2020-08-04&sr=c&sig=AtcEvfmIsTdwIgvX9xmMPxRiOEVUbsOqG7ePanPDSeY%3D' as [sas_uri]
            //                     FROM MST_ModelTemplate m
            //                     WHERE model_template_id = @model_template_id ;`
            var queryString = `SELECT 
                                    cfg.connection_display_name as [display_name],
                                    cfg.connection_description as [description],
                                    cfg.connection_provider as [provider],
                                    cfg.connection_sas_uri as [sas_uri]
                                 FROM MST_ModelTemplate m
                                 LEFT JOIN MST_ModelCFG cfg
                                 ON cfg.model_cfg_id = 1
                                 WHERE m.model_template_id = @model_template_id ;`
            result = await pool.request()
                .input('model_template_id', sql.Int, model_template_id)
                .query(queryString)

        } catch (error) {
            return error
        }
        return result
    },
    getTrainModelCfgProject: async (model_template_id) => {
        var result = false
        try {
            var pool = await sql.connect(config.sqlConn)
            // var queryString = `SELECT 
            //                       m.display_name as [display_name],
            //                       '' as [security_token],
            //                       m.display_name as [folder_path],
            //                       'https://vkpc-dev.cognitiveservices.azure.com/' as [recognitizer_service_uri],
            //                       '8299694395424512a644a9b45f1d51ba' as [api_key],
            //                       'v2.1' as [api_version],
            //                       m.description as [description]
            //                     FROM MST_ModelTemplate m
            //                     WHERE model_template_id = @model_template_id ;`
            var queryString = `SELECT 
                                    m.display_name as [display_name],
                                    '' as [security_token],
                                    m.display_name as [folder_path],
                                    cfg.project_recognitizer_service_uri as [recognitizer_service_uri],
                                    cfg.project_api_key as [api_key],
                                    cfg.project_api_version as [api_version],
                                    m.description as [description]
                                FROM MST_ModelTemplate m
                                LEFT JOIN MST_ModelCFG cfg
                                 ON cfg.model_cfg_id = 1
                                WHERE m.model_template_id = @model_template_id ;`
            result = await pool.request()
                .input('model_template_id', sql.Int, model_template_id)
                .query(queryString)

        } catch (error) {
            return error
        }
        return result
    },
}