module.exports = {
  environment: process.env.ENVIRONMENT,
  sqlConn: {
    user: process.env.MSSQL_USER,
    password: process.env.MSSQL_PASSWORD,
    server: process.env.MSSQL_SERVER,
    database: process.env.MSSQL_DATABASE,
    requestTimeout: 300000,
    options: {
      enableArithAbort: true,
      encrypt: true,
      idleTimeoutMillis: 300000
    }
  },
  upload: {
    v1: {
      filePath: './upload/ocr-files',
      projectPath: process.cwd(), //appDir, // Previously known as fullPath
      max_size: 10, // MB
      allow_file: ['pdf', 'xlsx'],
      single: {
        fieldname: 'file'
      }
    }
  },
  basicAuth: {
    users: { rpaUserPO: 'F[oyl8xu' }
  },
  mdmConf: {
    ApplicationId: 'd341870a-2442-42b7-8b0e-f0e07d5794c7',
    SecretKey: '8c0a1df8-c2a8-4bdb-92d6-dec8c9be6e0f'
  },
  mdmGetReference: {
    url: 'https://scgchem-mdmdev.scg.com/oauth/api/token',
    header: {
      ApplicationId: '',
      SecretKey: ''
    },
    body: {
      grant_type: 'password'
    }
  },
  azureStorage: {
    connectionString: process.env.EXTRACT_AZURE_STORAGE_CONNECTION_STRING,
    containerName: process.env.EXTRACT_AZURE_STORAGE_CONTAINER_NAME,

  },
  formrecognizer: {
    url: process.env.API_EXTRACT_URL + '/bsoextractorapi',
    body: {
      request_id: '',
      model_id: '',
      filename: '',
      specific_page: '',
    }
  },
  mdmMembersInfoByStartWithName: {
    url: 'https://scgchem-mdmdev.scg.com/v1.1/Api/GDCEmployeeInfo/MembersInfoByStartWithName',
    method: 'POST',
    header: {
      'Content-Type': 'application/json'
    },
    body: {
      startWithName: '',
      referenceToken: ''
    }
  },
  mdmMembersInfoByAdAccount: {
    url: 'https://scgchem-mdmdev.scg.com/v1.1/Api/GDCEmployeeInfo/MembersInfoByADAccount',
    method: 'POST',
    header: {
      'Content-Type': 'application/json'
    },
    body: {
      domain: 'cementhai',
      adAccount: '',
      referenceToken: ''
    }
  },
  RabbitMQ: {
    // Development
    host: 'sccbsalpqaa1.cementhai.com',
    port: 5671,
    username: 'QAintell01',
    password: 'passw0rd01',
    virtualHost: 'AllPay',
    ssl: {
      enabled: true,
    },
    defaultNamespace: 'AllPay.CreatePaymentRequest.Message',
    exchangeName: 'AllPay.VendorPayment.CreatePaymentRequest',
    requestMessageType: 'CreatePaymentRequestMessage',
    responseMessageType: 'CreatePaymentResponseMessage',
    AllPayCreatorUser: {
      name: 'intelligence Systems',
      company: '0110',
      username: 'QAwsINTELL01',
      password: 'qNKD9508',
    }

  },
  sso2GetProfile: process.env.SSO2_GET_PROFILE,
  trainModelFile: {
    local: {
      filePath: './upload/traindoc/',
      projectPath: process.cwd(), //appDir, // Previously known as fullPath
      max_size: 10, // MB
      allow_file: ['pdf', 'xlsx'],
      single: {
        fieldname: 'file'
      },
    },
    azureStorage: {
      connectionString: process.env.TRAIN_AZURE_STORAGE_CONNECTION_STRING,
      containerName: process.env.TRAIN_AZURE_STORAGE_CONTAINER_NAME,
    },
  },
}
