/*
Creator:            Apiwat Emem
Creation date:      29/06/2021
*/

const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getFavorite: async (favorite_id, is_active = 'Y', sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (favorite_id !== null) {
        result = await pool.request()
          .input('favorite_id', sql.Int, favorite_id)
          .input('is_active', sql.Char, is_active)
          .query('select favorite_id, masterdata_id, favorite_by, favorite_date, is_active from TRN_Favorites where favorite_id = @favorite_id and is_active = @is_active order by favorite_id ' + sort)
      }
      else {
        result = await pool.request()
          .input('is_active', sql.Char, is_active)
          .query('select favorite_id, masterdata_id, favorite_by, favorite_date, is_active from TRN_Favorites where is_active = @is_active order by favorite_id ' + sort)
      }
    } catch (error) {
      return error
    }
    return result
  },
  upsertFavorite: async (masterdata_id, is_active, favorite_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('masterdata_id', sql.Int, masterdata_id)
        .input('is_active', sql.Char, is_active)
        .input('favorite_by', sql.NVarChar, favorite_by)
        .query('MERGE INTO TRN_Favorites AS TARGET USING (SELECT COUNT(*) as [COUNT] FROM TRN_Favorites) AS SOURCE ON (masterdata_id = @masterdata_id AND favorite_by = @favorite_by) WHEN MATCHED THEN UPDATE SET is_active = @is_active WHEN NOT MATCHED BY TARGET THEN INSERT (masterdata_id, is_active, favorite_by, favorite_date) VALUES (@masterdata_id, @is_active, @favorite_by, getdate()); ')
    } catch (error) {
      return error
    }
    return result
  },
}