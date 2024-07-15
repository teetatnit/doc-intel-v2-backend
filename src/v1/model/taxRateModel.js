const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getTaxRate: async (code = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (code !== null) {
        result = await pool.request()
          .input('code', sql.NVarChar, code)
          // ***** 30/04/2021 Apiwat Emem Modify Start ***** //
          .query('select * from MST_TaxRates where code = @code')
        // ***** 30/04/2021 Apiwat Emem Modify End ***** //
      } else {
        result = await pool.request()
          // ***** 30/04/2021 Apiwat Emem Modify Start ***** //
          .query('select * from MST_TaxRates order by code ' + sort)
        // ***** 30/04/2021 Apiwat Emem Modify End ***** //
      }
    } catch (error) {
      return error
    }
    return result
  },
  getTaxRateByMasterDataId: async (masterdata_id) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('masterdata_id', sql.NVarChar, masterdata_id)
        .input('field_name', sql.NVarChar, "VATRate")
        .query('SELECT tr.* FROM TRN_MasterDataItems mdi LEFT JOIN MST_MasterFields mf ON mdi.field_id = mf.field_id LEFT JOIN MST_TaxRates tr ON mdi.default_value = tr.code WHERE mf.field_name = @field_name AND mdi.masterdata_id = @masterdata_id ;')
    } catch (error) {
      return error
    }
    return result
  }
}
