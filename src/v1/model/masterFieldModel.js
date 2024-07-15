const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getMasterField: async (sort = 'asc', is_show = 'Y', is_active = 'Y') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('is_show', sql.Char, is_show)
        .input('is_active', sql.Char, is_active)
        // ***** 30/04/2021 Apiwat Emem Modify Start ***** //
        .query('select * from MST_MasterFields where is_show = @is_show and is_active = @is_active order by [order] ' + sort)
        // ***** 30/04/2021 Apiwat Emem Modify End ***** //
    } catch (error) {
      return error
    }
    return result
  }
}
