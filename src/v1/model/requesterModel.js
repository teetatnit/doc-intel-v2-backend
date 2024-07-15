const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getRequesterRaw: async (sort = 'ASC') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)

      result = await pool.request()
        .query('SELECT * FROM TRN_Users ORDER BY user_id ' + sort)
    } catch (error) {
      return error
    }
    return result
  },
  getRequestersByStartWithName: async (prefix = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (prefix !== null) {
        result = await pool.request()
          .query(`select email as [value], name as [text] from TRN_Users where name like '%${prefix}%' order by name ${sort}`)
      } else {
        result = await pool.request()
          .query(`select email as [value], name as [text] from TRN_Users order by name ${sort}`)
      }
    } catch (error) {
      return error
    }
    return result
  },
  getRequestersByStartWithEmail: async (prefix = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (prefix !== null) {
        result = await pool.request()
          .query(`select email as [value], name as [text] from TRN_Users where email like '%${prefix}%' order by name ${sort}`)
      } else {
        result = await pool.request()
          .query(`select email as [value], name as [text] from TRN_Users order by name ${sort}`)
      }
    } catch (error) {
      return error
    }
    return result
  },
}
