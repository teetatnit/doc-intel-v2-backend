/*
Revisor:            Apiwat Emem
Revision date:      07/05/2021
Revision Reason:    Modify table name
*/

const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getVendorRaw: async (sort = 'ASC') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .query('SELECT * FROM MST_Vendors ORDER BY code ' + sort)
    } catch (error) {
      console.log(error)
      return error
    }
    return result
  },
  getVendor: async (code = null, sort = 'asc', is_active = 'Y') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (code !== null) {
        result = await pool.request()
          .input('code', sql.NVarChar, code)
          .input('is_active', sql.Char, is_active)
          // ***** 07/05/2021 Apiwat Emem Mod Start ***** //
          .query('select code as [vendor_code], code + \' \' + name as [vendor_name], email as [vendor_email] from MST_Vendors where code = @code and is_active = @is_active')
        // ***** 07/05/2021 Apiwat Emem Mod End ***** //
      } else {
        result = await pool.request()
          .input('is_active', sql.Char, is_active)
          // ***** 07/05/2021 Apiwat Emem Mod Start ***** //
          .query('select code as [vendor_code], code + \' \' + name as [vendor_name], email as [vendor_email] from MST_Vendors where is_active = @is_active order by code ' + sort)
        // ***** 07/05/2021 Apiwat Emem Mod End ***** //
      }
    } catch (error) {
      return error
    }
    return result
  },
  checkVendorByCode: async (code) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('code', sql.Char, code)
        .query('SELECT COUNT(code) as "count" from MST_Vendors WHERE code = @code')
    } catch (error) {
      console.log(error)
      return error
    }
    return result
  },
  updateVendor: async (code, name, update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('code', sql.Char, code)
        .input('name', sql.Char, name)
        // .input('update_by', sql.NVarChar, update_by)
        // .query('update MST_Vendors set name = @name, update_by = @update_by, update_date = getdate() where code = @code')
        .query('UPDATE MST_Vendors SET name = @name WHERE code = @code')
    } catch (error) {
      console.log(error)
      return error
    }
    return result
  },
  insertVendor: async (code, name, create_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('code', sql.Char, code)
        .input('name', sql.Char, name)
        // .input('create_by', sql.NVarChar, create_by)
        // .query('insert into MST_Vendors(code, name, create_by, create_date) values (@code, @name, @create_by, getdate());')
        .query('INSERT INTO MST_Vendors(code, name) VALUES (@code, @name);')
      } catch (error) {
      console.log(error)
      return error
    }
    return result
  },
  deleteVendorByVendorCode: async (division_code, is_active, update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('code', sql.Char, division_code)
        .input('is_active', sql.Char, is_active)
        // .input('update_by', sql.NVarChar, update_by)
        // .query('update MST_Vendors set is_active = @is_active, update_by = @update_by, update_date = getdate() where code = @code')
        .query('update MST_Vendors set is_active = @is_active where code = @code')
      } catch (error) {
      return error
    }
    return result
  },
}
