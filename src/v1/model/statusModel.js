const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getStatus: async (code = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (code !== null) {
        result = await pool.request()
          .input('code', sql.NVarChar, code)
          // ***** 30/04/2021 Apiwat Emem Modify Start ***** //
          .query('select * from MST_Status where code = @code')
          // ***** 30/04/2021 Apiwat Emem Modify End ***** //
      } else {
        result = await pool.request()
          // ***** 30/04/2021 Apiwat Emem Modify Start ***** //
          .query('select * from MST_Status order by code ' + sort)
          // ***** 30/04/2021 Apiwat Emem Modify End ***** //
      }  
    } catch (error) {
      return error
    }
    return result
  }
}
