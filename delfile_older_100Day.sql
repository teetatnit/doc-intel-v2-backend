  delete from [SKIC_EXPO].[dbo].[files] where [create_date] <= DATEADD(day,-100,GETDATE());
  delete from [SKIC_EXPO].[dbo].[po] where [create_date] <= DATEADD(day,-100,GETDATE());
  delete from [SKIC_EXPO].[dbo].[po_items] where [create_date] <= DATEADD(day,-100,GETDATE());