const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getCurrency: async (code = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (code !== null) {
        result = await pool.request()
          .input('code', sql.NVarChar, code)
          // ***** 14/05/2021 Apiwat Emem Modify Start ***** //
          .query('select code as [code], code + \' \' + name as [name] from MST_Currencies where code = @code')
          // ***** 14/05/2021 Apiwat Emem Modify End ***** //
      } else {
        result = await pool.request()
          // ***** 14/05/2021 Apiwat Emem Modify Start ***** //
          .query('select code as [code], code + \' \' + name as [name] from MST_Currencies order by code ' + sort)
          // ***** 14/05/2021 Apiwat Emem Modify End ***** //
      }   
    } catch (error) {
      return error
    }
    return result
  }
}
