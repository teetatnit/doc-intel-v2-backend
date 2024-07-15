const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getWhtRate: async (code = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (code !== null) {
        result = await pool.request()
          .input('code', sql.NVarChar, code)
          // ***** 30/04/2021 Apiwat Emem Modify Start ***** //
          .query('select * from MST_WhtRates where code = @code')
          // ***** 30/04/2021 Apiwat Emem Modify End ***** //
      } else {
        result = await pool.request()
          // ***** 30/04/2021 Apiwat Emem Modify Start ***** //
          .query('select * from MST_WhtRates order by code ' + sort)
          // ***** 30/04/2021 Apiwat Emem Modify End ***** //
      }   
    } catch (error) {
      return error
    }
    return result
  },
  getWhtRateByMasterDataId: async (masterdata_id) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
        var stringQuery = '(SELECT wr.rate FROM TRN_MasterDataItems mdi LEFT JOIN MST_MasterFields mf ON mdi.field_id = mf.field_id LEFT JOIN MST_WhtRates wr ON mdi.default_value = wr.code WHERE mf.field_name = @field_name AND mdi.masterdata_id = @masterdata_id) '
        stringQuery += 'UNION ALL (SELECT wr.rate FROM TRN_MasterDataItems mdi LEFT JOIN MST_MasterFields mf ON mdi.field_id = mf.field_id LEFT JOIN MST_WhtRates wr ON mdi.default_value = wr.code WHERE mf.field_name = @field_name_wht2 AND mdi.masterdata_id = @masterdata_id_wht2 UNION SELECT 0.00 as "rate" WHERE NOT EXISTS (SELECT wr.rate FROM TRN_MasterDataItems mdi LEFT JOIN MST_MasterFields mf ON mdi.field_id = mf.field_id LEFT JOIN MST_WhtRates wr ON mdi.default_value = wr.code WHERE mf.field_name = @field_name_wht2 AND mdi.masterdata_id = @masterdata_id_wht2)) '
        stringQuery += 'UNION ALL (SELECT wr.rate FROM TRN_MasterDataItems mdi LEFT JOIN MST_MasterFields mf ON mdi.field_id = mf.field_id LEFT JOIN MST_WhtRates wr ON mdi.default_value = wr.code WHERE mf.field_name = @field_name_wht3 AND mdi.masterdata_id = @masterdata_id_wht3 UNION SELECT 0.00 as "rate" WHERE NOT EXISTS (SELECT wr.rate FROM TRN_MasterDataItems mdi LEFT JOIN MST_MasterFields mf ON mdi.field_id = mf.field_id LEFT JOIN MST_WhtRates wr ON mdi.default_value = wr.code WHERE mf.field_name = @field_name_wht3 AND mdi.masterdata_id = @masterdata_id_wht3)) '
        stringQuery += 'UNION ALL (SELECT wr.rate FROM TRN_MasterDataItems mdi LEFT JOIN MST_MasterFields mf ON mdi.field_id = mf.field_id LEFT JOIN MST_WhtRates wr ON mdi.default_value = wr.code WHERE mf.field_name = @field_name_wht4 AND mdi.masterdata_id = @masterdata_id_wht4 UNION SELECT 0.00 as "rate" WHERE NOT EXISTS (SELECT wr.rate FROM TRN_MasterDataItems mdi LEFT JOIN MST_MasterFields mf ON mdi.field_id = mf.field_id LEFT JOIN MST_WhtRates wr ON mdi.default_value = wr.code WHERE mf.field_name = @field_name_wht4 AND mdi.masterdata_id = @masterdata_id_wht4)) '
        stringQuery += 'UNION ALL (SELECT wr.rate FROM TRN_MasterDataItems mdi LEFT JOIN MST_MasterFields mf ON mdi.field_id = mf.field_id LEFT JOIN MST_WhtRates wr ON mdi.default_value = wr.code WHERE mf.field_name = @field_name_wht5 AND mdi.masterdata_id = @masterdata_id_wht5 UNION SELECT 0.00 as "rate" WHERE NOT EXISTS (SELECT wr.rate FROM TRN_MasterDataItems mdi LEFT JOIN MST_MasterFields mf ON mdi.field_id = mf.field_id LEFT JOIN MST_WhtRates wr ON mdi.default_value = wr.code WHERE mf.field_name = @field_name_wht5 AND mdi.masterdata_id = @masterdata_id_wht5)) ;'
        result = await pool.request()
          .input('masterdata_id', sql.NVarChar, masterdata_id)
          .input('masterdata_id_wht2', sql.NVarChar, masterdata_id)
          .input('masterdata_id_wht3', sql.NVarChar, masterdata_id)
          .input('masterdata_id_wht4', sql.NVarChar, masterdata_id)
          .input('masterdata_id_wht5', sql.NVarChar, masterdata_id)
          .input('field_name', sql.NVarChar, "WHTRate")
          .input('field_name_wht2', sql.NVarChar, "WHT2Rate")
          .input('field_name_wht3', sql.NVarChar, "WHT3Rate")
          .input('field_name_wht4', sql.NVarChar, "WHT4Rate")
          .input('field_name_wht5', sql.NVarChar, "WHT5Rate")
          .query(stringQuery)  
    } catch (error) {
      return error
    }
    return result
  }
}
