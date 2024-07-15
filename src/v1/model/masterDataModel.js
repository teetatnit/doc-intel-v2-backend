/*
Revisor:            Apiwat E.
Revision date:      30/Apr/2021
Revision Reason:    Modify table name

Revisor:            Chanakan C.
Revision date:      5/May/2021
Revision Reason:    Modify query getMasterDataItem

Revisor:            Apiwat E.
Revision date:      07/05/2021
Revision Reason:    Modify table name
*/

const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getMasterdatasByModelTemplateId: async (modelTemplateId) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      const queryStaring = `SELECT 
                              master_data.masterdata_id,
                              document.[name] as [document_name],
                              CONCAT(vendor.[code], ' - ', vendor.[name]) as [vendor_name],
                              master_data.additional_info,
                              create_user.[name] as [create_user_name],
                              master_data.create_date
                            FROM TRN_MasterDatas master_data
                            LEFT JOIN MST_Documents document
                            ON master_data.document_code = document.code
                            LEFT JOIN MST_Vendors vendor
                            ON master_data.vendor_code = vendor.code
                            LEFT JOIN TRN_Users create_user 
                            ON master_data.create_by = create_user.email
                            WHERE master_data.model_template_id = @model_template_id`
      result = await pool.request()
        .input('model_template_id', sql.Char, modelTemplateId)
        .query(queryStaring)
    } catch (error) {
      return error
    }
    return result
  },
  getMasterData: async (masterdata_id = null, email, sort = 'asc', is_active = 'Y') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (masterdata_id !== null) {
        const queryStaring = `select distinct 
                                m.[masterdata_id] as [masterdata_id], 
                                m.[document_code] as [document_code], 
                                m.[vendor_code] as [vendor_code], 
                                m.[additional_info] as [additional_info],
                                m.[number_style_id] as [number_style_id], 
                                m.[model_id] as [model_id], 
                                m.[model_template_id] as [model_template_id],
                                m.[ai_prompt] as [ai_prompt],
                                m.[day_auto_duedate] as [day_auto_duedate],
                                m.[is_active] as [is_active], 
                                m.[create_by] as [create_by], 
                                m.[create_date] as [create_date], 
                                m.[update_by] as [update_by], 
                                m.[update_date] as [update_date], 
                                d.[name] as [document_name], v.[code] + ' ' + v.[name] as [vendor_name], 
                                v.[email] as [vendor_email],
                                mt.display_name as [model_template] 
                                from TRN_MasterDatas m 
                                left join MST_Documents d 
                                on m.[document_code] = d.code 
                                left join MST_Vendors v 
                                on m.[vendor_code] = v.code 
                                left join MST_ModelTemplate mt 
                                on m.[model_template_id] = mt.model_template_id 
                                where m.[masterdata_id] = @masterdata_id 
                                and m.[is_active] = @is_active `
        result = await pool.request()
          .input('masterdata_id', sql.Int, masterdata_id)
          .input('is_active', sql.Char, is_active)
          .query(queryStaring)
      }
      else {
        const queryStaring = `select * from (
                                            select distinct 
                                                m.[masterdata_id] as [masterdata_id], 
                                                m.[document_code] as [document_code], 
                                                m.[vendor_code] as [vendor_code], 
                                                m.[additional_info] as [additional_info], 
                                                m.[number_style_id] as [number_style_id], 
                                                m.[model_id] as [model_id], 
                                                m.[model_template_id] as [model_template_id], 
                                                m.[is_active] as [is_active], m.[create_by] as [create_by], 
                                                m.[create_date] as [create_date], 
                                                m.[update_by] as [update_by], 
                                                m.[update_date] as [update_date], 
                                                d.[name] as [document_name], 
                                                v.[code] + \' \' + v.[name] as [vendor_name], 
                                                v.[email] as [vendor_email], 
                                                mt.display_name as [model_template] ,
                                                u.[name] as [create_name], 
                                                isnull(f.is_active, 0) as [favorite_is_active], 
                                                row_number() over(order by m.[masterdata_id] asc) as Row# 
                                              from TRN_MasterDatas m 
                                              inner join TRN_Users u 
                                              on m.create_by = u.email 
                                              and u.email = @email 
                                              left join MST_Documents d 
                                              on m.[document_code] = d.code 
                                              left join MST_Vendors v 
                                              on m.[vendor_code] = v.code 
                                              left join MST_ModelTemplate mt 
                                              on m.[model_template_id] = mt.model_template_id 
                                              left join TRN_Favorites f 
                                              on m.masterdata_id = f.masterdata_id 
                                              and f.favorite_by = @email 
                                              where m.[is_active] = @is_active 
                                            union 
                                              select distinct 
                                              m.[masterdata_id] as [masterdata_id], 
                                              m.[document_code] as [document_code], 
                                              m.[vendor_code] as [vendor_code], 
                                              m.[additional_info] as [additional_info], 
                                              m.[number_style_id] as [number_style_id], 
                                              m.[model_id] as [model_id],
                                              m.[model_template_id] as [model_template_id], 
                                              m.[is_active] as [is_active], m.[create_by] as [create_by], 
                                              m.[create_date] as [create_date], m.[update_by] as [update_by], 
                                              m.[update_date] as [update_date], 
                                              d.[name] as [document_name], 
                                              v.[code] + \' \' + v.[name] as [vendor_name], 
                                              v.[email] as [vendor_email], 
                                              mt.display_name as [model_template] ,
                                              u.[name] as [create_name], isnull(f.is_active, 0) as [favorite_is_active], 
                                              (select count(masterdata_id) 
                                                from TRN_MasterDatas 
                                                where create_by = @email 
                                                and [is_active] = @is_active) + row_number() over(order by m.[masterdata_id] asc) as Row# 
                                              from TRN_MasterDatas m 
                                              inner join TRN_Users u on m.create_by = u.email 
                                              and u.email <> @email 
                                              inner join (select * from TRN_Users where email = @email) e 
                                              on u.company_code = e.company_code 
                                              and u.division_code = e.division_code 
                                              left join MST_Documents d 
                                              on m.[document_code] = d.code 
                                              left join MST_Vendors v 
                                              on m.[vendor_code] = v.code 
                                              left join MST_ModelTemplate mt 
                                              on m.[model_template_id] = mt.model_template_id 
                                              left join TRN_Favorites f 
                                              on m.masterdata_id = f.masterdata_id 
                                              and f.favorite_by = @email 
                                              where m.[is_active] = @is_active 
                                          ) a 
                              order by Row# ${sort}`
        result = await pool.request()
          .input('is_active', sql.Char, is_active)
          .input('email', sql.NVarChar, email)
          .query(queryStaring)
      }
    } catch (error) {
      console.log(error)
      return error
    }
    return result
  },
  getMasterDataItem: async (masterdata_id, sort = 'asc', is_show = 'Y', is_active = 'Y') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('masterdata_id', sql.Int, masterdata_id)
        // ***** 27/05/2021 Apiwat Emem. Mod Start ***** //
        .input('is_show', sql.Char, is_show)
        .input('is_active', sql.Char, is_active)
        .query('SELECT items.item_id, items.masterdata_id, case when items.item_id is null then fields.is_ocr else items.is_ocr end as is_ocr, case when items.item_id is null then fields.is_variable else items.is_variable end as is_variable, case when items.item_id is null then fields.is_display else items.is_display end as is_display, fields.field_id, case when items.item_id is null then fields.default_value else items.default_value end as default_value, fields.field_name, fields.display_name, fields.field_type, fields.field_length, fields.[order], fields.[is_requirefield] FROM MST_MasterFields fields LEFT JOIN TRN_MasterDataItems items ON items.field_id = fields.field_id AND items.masterdata_id = @masterdata_id WHERE fields.is_show = @is_show and fields.is_active = @is_active ORDER BY fields.[order] ' + sort)
      // ***** 27/05/2021 Apiwat Emem. Mod End ***** //
    } catch (error) {
      return error
    }
    return result
  },
  // ***** 07/05/2021 Apiwat Emem Mod Start ***** //
  createMasterData: async (document_code, vendor_code, additional_info = '', number_style_id = 1 ,model_id, model_template_id, ai_prompt, day_auto_duedate, create_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('document_code', sql.NVarChar, document_code)
        .input('vendor_code', sql.NVarChar, vendor_code)
        .input('additional_info', sql.NVarChar, additional_info)
        .input('number_style_id', sql.BigInt, number_style_id)
        .input('model_id', sql.NVarChar, model_id)
        .input('model_template_id', sql.NVarChar, model_template_id)
        .input('ai_prompt', sql.NVarChar, ai_prompt)
        .input('day_auto_duedate', sql.Int, day_auto_duedate)
        .input('create_by', sql.NVarChar, create_by)
        .query('insert into TRN_MasterDatas(document_code, vendor_code, additional_info, number_style_id, model_id, model_template_id, ai_prompt, day_auto_duedate, create_by, create_date) values(@document_code, @vendor_code, @additional_info, @number_style_id, @model_id, @model_template_id, @ai_prompt, @day_auto_duedate, @create_by, getdate()); select scope_identity() as id;')
    } catch (error) {
      return error
    }
    return result
  },
  // ***** 07/05/2021 Apiwat Emem Mod End ***** //
  createMasterDataItem: async (masterdata_id, items) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var i;
      for (i = 0; i < items.length; i++) {
        result = await pool.request()
          .input('masterdata_id', sql.Int, masterdata_id)
          .input('is_ocr', sql.Bit, items[i].is_ocr)
          .input('is_variable', sql.Bit, items[i].is_variable)
          .input('field_id', sql.Int, items[i].field_id)
          .input('default_value', sql.NVarChar, items[i].default_value === null || items[i].default_value === undefined ? '' : items[i].default_value)
          // ***** 25/05/2021 Apiwat Emem Modify Start ***** //
          .input('is_display', sql.Bit, items[i].is_display)
          .query('insert into TRN_MasterDataItems(masterdata_id, is_ocr, is_variable, is_display, field_id, default_value) values (@masterdata_id, @is_ocr, @is_variable, @is_display, @field_id, @default_value);')
        // ***** 25/05/2021 Apiwat Emem Modify End ***** //
      }
    } catch (error) {
      return error
    }
    return result
  },
  // ***** 25/05/2021 Apiwat Emem Modify Start ***** //
  // upsertMasterDataItem: async (masterdata_id, items) => {
  //   var result = false
  //   try {
  //     var pool = await sql.connect(config.sqlConn)
  //     var i;
  //     for (i = 0; i < items.length; i++) {
  //       if (items[i].item_id === null || items[i].item_id === undefined) {
  //         result = await pool.request()
  //           .input('masterdata_id', sql.Int, masterdata_id)
  //           .input('is_ocr', sql.Bit, items[i].is_ocr)
  //           .input('is_display', sql.Bit, items[i].is_display)
  //           .input('field_id', sql.Int, items[i].field_id)
  //           .input('default_value', sql.NVarChar, items[i].default_value === null || items[i].default_value === undefined ? '' : items[i].default_value)
  //           .query('insert into TRN_MasterDataItems(masterdata_id, is_ocr, is_display, field_id, default_value) values (@masterdata_id, @is_ocr, @is_display, @field_id, @default_value);')
  //       } else {
  //         result = await pool.request()
  //           .input('item_id', sql.Int, items[i].item_id)
  //           .input('is_ocr', sql.Bit, items[i].is_ocr)
  //           .input('is_display', sql.Bit, items[i].is_display)
  //           .input('default_value', sql.NVarChar, items[i].default_value === null || items[i].default_value === undefined ? '' : items[i].default_value)
  //           .query('update TRN_MasterDataItems set is_ocr = @is_ocr, is_display = @is_display, default_value = @default_value where item_id = @item_id ;')
  //       }
  //     }
  //   } catch (error) {
  //     return error
  //   }
  //   return result
  // },
  upsertMasterDataItem: async (masterdata_id, items) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var i;
      for (i = 0; i < items.length; i++) {
        if (items[i].item_id === null || items[i].item_id === undefined) {
          result = await pool.request()
            .input('masterdata_id', sql.Int, masterdata_id)
            .input('is_ocr', sql.Bit, items[i].is_ocr)
            .input('is_variable', sql.Bit, items[i].is_variable)
            .input('is_display', sql.Bit, items[i].is_display)
            .input('field_id', sql.Int, items[i].field_id)
            .input('default_value', sql.NVarChar, items[i].default_value === null || items[i].default_value === undefined ? '' : items[i].default_value)
            .query('insert into TRN_MasterDataItems(masterdata_id, is_ocr, is_variable, is_display, field_id, default_value) values (@masterdata_id, @is_ocr, @is_variable, @is_display, @field_id, @default_value);')
        } else {
          result = await pool.request()
            .input('item_id', sql.Int, items[i].item_id)
            .input('is_ocr', sql.Bit, items[i].is_ocr)
            .input('is_variable', sql.Bit, items[i].is_variable)
            .input('is_display', sql.Bit, items[i].is_display)
            .input('default_value', sql.NVarChar, items[i].default_value === null || items[i].default_value === undefined ? '' : items[i].default_value)
            .query('update TRN_MasterDataItems set is_ocr = @is_ocr, is_variable = @is_variable, is_display = @is_display, default_value = @default_value where item_id = @item_id ;')
        }
      }
    } catch (error) {
      return error
    }
    return result
  },
  // ***** 25/05/2021 Apiwat Emem Modify End ***** //
  deleteMasterDataItem: async (masterdata_id, items) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var i;
      for (i = 0; i < items.length; i++) {
        result = await pool.request()
          .input('item_id', sql.Int, items[i].item_id)
          .query('delete TRN_MasterDataItems where item_id = @item_id')
      }
    } catch (error) {
      return error
    }
    return result
  },
  // ***** 28/05/2021 Apiwat Emem Mod Start ***** //
  updateMasterData: async (masterdata_id, additional_info, number_style_id, ai_prompt, day_auto_duedate, update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('masterdata_id', sql.Int, masterdata_id)
        .input('additional_info', sql.NVarChar, additional_info)
        .input('ai_prompt', sql.NVarChar, ai_prompt)
        .input('day_auto_duedate', sql.Int, day_auto_duedate)
        .input('number_style_id', sql.BigInt, number_style_id)
        .input('update_by', sql.NVarChar, update_by)
        .query('update TRN_MasterDatas set additional_info = @additional_info, number_style_id = @number_style_id, ai_prompt = @ai_prompt, day_auto_duedate = @day_auto_duedate, update_by = @update_by, update_date = getdate() where masterdata_id = @masterdata_id')
    } catch (error) {
      return error
    }
    return result
  },
  updateMasterDataModelTemplateId: async (masterdata_id, model_template_id) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('masterdata_id', sql.Int, masterdata_id)
        .input('model_template_id', sql.NVarChar, model_template_id)
        .query('UPDATE TRN_MasterDatas SET model_template_id = @model_template_id WHERE masterdata_id = @masterdata_id')
    } catch (error) {
      return error
    }
    return result
  },
  // ***** 26/05/2021 Apiwat Emem Mod End ***** //
  deleteMasterDataByMasterDataId: async (masterdata_id, is_active, update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('masterdata_id', sql.Int, masterdata_id)
        .input('is_active', sql.Char, is_active)
        .input('update_by', sql.NVarChar, update_by)
        // ***** 30/Apr/2021 Apiwat Emem Mod Start ***** //
        .query('update TRN_MasterDatas set is_active = @is_active, update_by = @update_by, update_date = getdate() where masterdata_id = @masterdata_id')
      // ***** 30/Apr/2021 Apiwat Emem Mod End ***** //
    } catch (error) {
      return error
    }
    return result
  },
  deleteMasterDataItemsByMasterDataId: async (masterdata_id) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('masterdata_id', sql.Int, masterdata_id)
        // ***** 30/Apr/2021 Apiwat Emem Mod Start ***** //
        .query('delete TRN_MasterDataItems where masterdata_id = @masterdata_id')
      // ***** 30/Apr/2021 Apiwat Emem Mod End ***** //
    } catch (error) {
      return error
    }
    return result
  },
  // ***** 07/05/2021 Apiwat Emem Mod Start ***** //
  getVendorByDocumentCode: async (document_code, orderBy = 'asc', is_active = 'Y', user) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (document_code !== null) {
        result = await pool.request()
          .input('document_code', sql.NVarChar, document_code)
          .input('is_active', sql.Char, is_active)
          .input('user', sql.NVarChar, user)
          // ***** 29/06/2021 Apiwat Emem Mod Start ***** //
          .query('select distinct v.code as [vendor_code], v.name as [vendor_name], v.email as [vendor_email] from TRN_MasterDatas m inner join MST_Vendors v on m.vendor_code = v.code and v.is_active = @is_active inner join TRN_Favorites f on m.masterdata_id = f.masterdata_id and f.is_active = \'true\' AND f.favorite_by = @user where m.document_code = @document_code and m.is_active = @is_active order by v.code ' + orderBy)
        // ***** 29/06/2021 Apiwat Emem Mod Start ***** //
      } else {
        result = await pool.request()
          .input('is_active', sql.Char, is_active)
          .query('select distinct v.code as [vendor_code], v.name as [vendor_name], v.email as [vendor_email] from TRN_MasterDatas m inner join MST_Vendors v on m.vendor_code = v.code and v.is_active = @is_active where m.is_active = @is_active order by v.code ' + orderBy)
      }
    } catch (error) {
      return error
    }
    return result
  },
  getAdditionalInfoByDocumentCodeVendorCode: async (document_code, vendor_code, orderBy = 'asc', is_active = 'Y', user) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (document_code !== null && vendor_code !== null) {
        result = await pool.request()
          .input('document_code', sql.NVarChar, document_code)
          .input('vendor_code', sql.NVarChar, vendor_code)
          .input('is_active', sql.Char, is_active)
          .input('user', sql.NVarChar, user)
          // ***** 29/06/2021 Apiwat Emem Mod Start ***** //
          .query('select distinct m.masterdata_id, isnull(m.additional_info,\'\') as additional_info from TRN_MasterDatas m inner join TRN_Favorites f on m.masterdata_id = f.masterdata_id and f.is_active = \'true\' AND f.favorite_by = @user where m.document_code = @document_code and m.vendor_code = @vendor_code and m.is_active = @is_active order by isnull(m.additional_info,\'\') ' + orderBy)
        // ***** 29/06/2021 Apiwat Emem Mod End ***** //
      } else {
        result = await pool.request()
          .input('is_active', sql.Char, is_active)
          // ***** 30/Apr/2021 Apiwat Emem Mod Start ***** //
          .query('select distinct masterdata_id, isnull(additional_info,\'\') as additional_info from TRN_MasterDatas where is_active = @is_active order by additional_info ' + orderBy)
        // ***** 30/Apr/2021 Apiwat Emem Mod End ***** //
      }
    } catch (error) {
      return error
    }
    return result
  },
  // ***** 07/05/2021 Apiwat Emem Mod End ***** //
  // ***** 28/05/2021 Apiwat Emem Modify Start ***** //
  checkMasterData: async (masterdata_id = null, document_code, vendor_code, additional_info, is_active = 'Y') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (masterdata_id !== null) {
        result = await pool.request()
          .input('masterdata_id', sql.Int, masterdata_id)
          .input('document_code', sql.NVarChar, document_code)
          .input('vendor_code', sql.NVarChar, vendor_code)
          .input('additional_info', sql.NVarChar, additional_info)
          .input('is_active', sql.Char, is_active)
          .query('select count(masterdata_id) as "count" from TRN_MasterDatas where document_code = @document_code and vendor_code = @vendor_code and additional_info = @additional_info and masterdata_id <> @masterdata_id and is_active = @is_active')
      } else {
        result = await pool.request()
          .input('document_code', sql.NVarChar, document_code)
          .input('vendor_code', sql.NVarChar, vendor_code)
          .input('additional_info', sql.NVarChar, additional_info)
          .input('is_active', sql.Char, is_active)
          .query('select count(masterdata_id) as "count" from TRN_MasterDatas where document_code = @document_code and vendor_code = @vendor_code and additional_info = @additional_info and is_active = @is_active')
      }
    } catch (error) {
      return error
    }
    return result
  },
  // ***** 28/05/2021 Apiwat Emem Modify End ***** //
  // ***** 25/05/2021 Apiwat Emem Modify Start ***** //
  getMasterFieldByFieldData: async (field_data = 'H', is_masterfield = 'Y', is_active = 'Y', sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('is_masterfield', sql.Char, is_masterfield)
        .input('field_data', sql.Char, field_data)
        .input('is_active', sql.Char, is_active)
        .query('select * from MST_MasterFields where masterfield_order is not null and is_masterfield = @is_masterfield and field_data = @field_data and is_active = @is_active order by masterfield_order ' + sort)
    } catch (error) {
      return error
    }
    return result
  },
  // ***** 25/05/2021 Apiwat Emem Modify Start ***** //

  // ***** 10/Oct/2022 Kittichai R. Add train model Start ***** //
  getMasterDataItemsByModelTemplateId: async (model_template_id, orderBy = 'ASC') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      const queryString = `SELECT 
                                mf.field_name as [field_name], 
                                mf.display_name as [display_name],
                                mf.default_value as [default_value],
                                mf.field_data as [field_data],
                                mf.field_type as [field_type]
                              FROM MST_ModelTemplate mt
                              LEFT JOIN TRN_MasterDataItems mdi
                              ON mt.masterdata_id =  mdi.masterdata_id
                              LEFT JOIN MST_MasterFields mf
                              ON mdi.field_id = mf.field_id
                              WHERE mt.model_template_id = @model_template_id
                              AND mdi.is_ocr = 1
                              ORDER BY mf.[order] ${orderBy} ;`
      result = await pool.request()
        .input('model_template_id', sql.NVarChar, model_template_id)
        .query(queryString)
    } catch (error) {
      console.log("error", error)
      return error
    }
    return result
  },
  getBusinessPartnerByDocumentCode: async (document_code, orderBy = 'ASC', is_active = 'Y') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      const queryString = `SELECT DISTINCT 
                                p.code as [partner_code], 
                                p.name as [partner_name]
                              FROM TRN_MasterDatas m 
                              INNER JOIN MST_BusinessPartner p 
                              ON m.partner_code = p.code AND p.is_active = @is_active 
                              WHERE m.document_code = @document_code
                              AND m.is_active = @is_active 
                              ORDER BY p.code ${orderBy} ;`
      result = await pool.request()
        .input('document_code', sql.NVarChar, document_code)
        .input('is_active', sql.Char, is_active)
        .query(queryString)
    } catch (error) {
      return error
    }
    return result
  },
  getAdditionalInfoByDocumentCodeBusinessPartnerCode: async (document_code, partner_code, orderBy = 'ASC', is_active = 'Y') => {
    var result = false
    try {
      const queryString = `SELECT DISTINCT 
                              masterdata_id, 
                              ISNULL(additional_info,'') AS additional_info 
                            FROM TRN_MasterDatas
                            WHERE document_code = @document_code
                            AND partner_code = @partner_code
                            AND is_active = @is_active 
                            ORDER BY additional_info ${orderBy} ;`
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('document_code', sql.Char, document_code)
        .input('partner_code', sql.Char, partner_code)
        .input('is_active', sql.Char, is_active)
        .query(queryString)

    } catch (error) {
      return error
    }
    return result
  },

  // ***** 10/Oct/2022 Kittichai R. Add train model End ***** //
}