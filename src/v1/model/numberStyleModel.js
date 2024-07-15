const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getNumberStyle: async (id = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (id !== null) {
        result = await pool.request()
          .input('id', sql.NVarChar, id)
          .query('select id as [id], name as [name] from MST_NumberStyle where id = @id')
      } else {
        result = await pool.request()
          .query('select id as [id], name as [name] from MST_NumberStyle order by id ' + sort)
      }   
    } catch (error) {
      return error
    }
    return result
  }
}
