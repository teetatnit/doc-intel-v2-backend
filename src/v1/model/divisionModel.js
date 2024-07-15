const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getDivision: async (is_active = 'Y', sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
      .input('is_active', sql.Char, is_active)
        .query('select code as [division_code], name as [division_name] from MST_Divisions WHERE is_active = @is_active order by code ' + sort)
    } catch (error) {
      return error
    }
    return result
  },
  checkDivisionByCode: async (division_code, is_active = 'Y') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('code', sql.Char, division_code)
        .input('is_active', sql.Char, is_active)
        .query('select count(code) as "count" from MST_Divisions where code = @code and is_active = @is_active')
    } catch (error) {
      return error
    }
    return result
  },
  updateDivision: async (division_code, division_name, update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('code', sql.Char, division_code)
        .input('name', sql.Char, division_name)
        .input('update_by', sql.NVarChar, update_by)
        .query('update MST_Divisions set name = @name, update_by = @update_by, update_date = getdate() where code = @code')
    } catch (error) {
      return error
    }
    return result
  },
  insertDivision: async (division_code, division_name, create_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('code', sql.Char, division_code)
        .input('name', sql.Char, division_name)
        .input('create_by', sql.NVarChar, create_by)
        .query('insert into MST_Divisions(code, name, create_by, create_date) values (@code, @name, @create_by, getdate());')
    } catch (error) {
      console.log(error)
      return error
    }
    return result
  },
  deleteDivisionByDivisionCode: async (division_code, is_active, update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('code', sql.Char, division_code)
        .input('is_active', sql.Char, is_active)
        .input('update_by', sql.NVarChar, update_by)
        .query('update MST_Divisions set is_active = @is_active, update_by = @update_by, update_date = getdate() where code = @code')
    } catch (error) {
      return error
    }
    return result
  },
}

