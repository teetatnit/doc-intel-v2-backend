/*
Creator:            Apiwat Emem
Creation date:      27/05/2021
*/

const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getPaidFor: async (code = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (code !== null) {
        result = await pool.request()
          .input('code', sql.NVarChar, code)
          .query('select code as [code], code + \' \' + name as [name] from MST_PaidFors where code = @code')
      } else {
        result = await pool.request()
          .query('select code as [code], code + \' \' + name as [name] from MST_PaidFors order by code ' + sort)
      }  
    } catch (error) {
      return error
    }
    return result
  }
}
