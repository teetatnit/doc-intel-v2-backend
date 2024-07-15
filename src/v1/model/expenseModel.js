/*
Creator:            Apiwat Emem
Creation date:      06/05/2021
*/

const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getExpenseRaw: async (sort = 'ASC') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)

      result = await pool.request()
        .query('SELECT * FROM MST_Expenses ORDER BY code ' + sort)
    } catch (error) {
      return error
    }
    return result
  },
  getExpense: async (code = null, is_active = 'Y', sort = 'ASC') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (code !== null) {
        result = await pool.request()
          .input('code', sql.NVarChar, code)
          .input('is_active', sql.NVarChar, is_active)
          .query('SELECT code as [code], code + \' \' + name as [name] FROM MST_Expenses WHERE code = @code AND is_active = @is_active')
      } else {
        result = await pool.request()
          .query('SELECT code as [code], code + \' \' + name as [name] FROM MST_Expenses ORDER BY code ' + sort)
      }
    } catch (error) {
      return error
    }
    return result
  },
  checkExpenseByCode: async (code) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('code', sql.Char, code)
        .query('SELECT COUNT(code) as "count" from MST_Expenses WHERE code = @code')
    } catch (error) {
      console.log(error)
      return error
    }
    return result
  },
  updateExpense: async (code, name, update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('code', sql.Char, code)
        .input('name', sql.NVarChar, name)
        .input('update_by', sql.NVarChar, update_by)
        .query('UPDATE MST_Expenses SET name = @name, update_by = @update_by, update_date = getdate() WHERE code = @code')
    } catch (error) {
      console.log(error)
      return error
    }
    return result
  },
  insertExpense: async (code, name, create_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('code', sql.Char, code)
        .input('name', sql.Char, name)
        .input('create_by', sql.NVarChar, create_by)
        .query('INSERT INTO MST_Expenses(code, name, create_by, create_date) VALUES (@code, @name, @create_by, getdate());')
      } catch (error) {
      console.log(error)
      return error
    }
    return result
  },
  deleteExpenseByExpenseCode: async (division_code, is_active, update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('code', sql.Char, division_code)
        .input('is_active', sql.Char, is_active)
        .input('update_by', sql.NVarChar, update_by)
        .query('UPDATE MST_Expenses SET is_active = @is_active, update_by = @update_by, update_date = getdate() WHERE code = @code')
      } catch (error) {
      return error
    }
    return result
  },
}
