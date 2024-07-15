require('dotenv').config()
const express = require('express')
const app = express()
var cors = require('cors')
const bodyParser = require('body-parser')
const basicAuth = require('express-basic-auth')
const confBasic = require('./config/sitConfig').basicAuth
var apiRouter = require('./src')
var port = process.env.PORT || 3000
var apiName = 'DOCUMENT ANALYTICS API'
var dateFormat = require('dateformat')
var curDate = new Date()

app.get('/', (req, res) => res.send('Hello [' + apiName + ']'))
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true , limit: '50mb'}))
app.use(bodyParser.json({limit: '50mb'}))
app.use([apiRouter])
app.use(basicAuth(confBasic))

app.listen(port, () => console.log(apiName + ' listening on port ' + port + ' :: ' + dateFormat(curDate, 'yyyy-mm-dd HH:MM:ss')))
