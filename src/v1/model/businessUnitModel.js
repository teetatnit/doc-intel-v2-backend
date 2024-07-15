const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getBusinessunitRaw: async (sort = 'ASC') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)

      result = await pool.request()
        .query('SELECT * FROM MST_BusinessUnit ORDER BY code ' + sort)
    } catch (error) {
      return error
    }
    return result
  },
  getBusinessUnit: async (is_active = 'Y', sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)

      result = await pool.request()
        .input('is_active', sql.NVarChar, is_active)
        .query('select code as [business_unit_code], name as [business_unit_name] from MST_BusinessUnit where is_active = @is_active order by code ' + sort)

    } catch (error) {
      return error
    }
    return result
  },
  checkBusinessUnitByCode: async (business_unit_code, is_active = 'Y') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('code', sql.Char, business_unit_code)
        .input('is_active', sql.Char, is_active)
        .query('select count(code) as "count" from MST_BusinessUnit where code = @code and is_active = @is_active')
    } catch (error) {
      return error
    }
    return result
  },
  updateBusinessUnit: async (business_unit_code, business_unit_name, update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('code', sql.Char, business_unit_code)
        .input('name', sql.Char, business_unit_name)
        .input('update_by', sql.NVarChar, update_by)
        .query('update MST_BusinessUnit set name = @name, update_by = @update_by, update_date = getdate() where code = @code')
    } catch (error) {
      return error
    }
    return result
  },
  insertBusinessUnit: async (business_unit_code, business_unit_name, create_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('code', sql.Char, business_unit_code)
        .input('name', sql.Char, business_unit_name)
        .input('create_by', sql.NVarChar, create_by)
        .query('insert into MST_BusinessUnit(code, name, create_by, create_date) values (@code, @name, @create_by, getdate());')
    } catch (error) {
      console.log(error)
      return error
    }
    return result
  },
  deleteBusinessUnitByBusinessUnitCode: async (business_unit_code, is_active, update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('code', sql.Char, business_unit_code)
        .input('is_active', sql.Char, is_active)
        .input('update_by', sql.NVarChar, update_by)
        .query('update MST_BusinessUnit set is_active = @is_active, update_by = @update_by, update_date = getdate() where code = @code')
    } catch (error) {
      return error
    }
    return result
  },
}
