var express = require('express')
var axios = require('axios');
var qs = require('qs');
var router = express.Router()
var v1 = require('./v1/route/route')
var logger = require('../util/logger4js')
var config = require('../config/sitConfig')
var responseHandle = require('../util/response')
var userModel = require('./v1/model/userModel')
logger.info('Start API Service !')


const checkAuth = async (req, res, next) => {
  if (typeof req.header('Authorization') !== 'undefined' && req.header('Authorization').length > 0) {
    try {
      const token = req.header('Authorization')
      const resUserDetail = await axios.get(config.sso2GetProfile, {
        headers: {
          Authorization: token
        }
      })
      if (typeof resUserDetail.data !== 'undefined') {
        const usernameStringList = resUserDetail.data.email.split('@')
        req.cur_user = usernameStringList[0]
        console.log(`Check auth ${req.originalUrl} is passed`)
        logger.info(`Check auth ${req.originalUrl} is passed`)
        next()
      } else {
        console.log(`Check auth ${req.originalUrl} verify sso account failed`)
        logger.error(`Check auth ${req.originalUrl} verify sso account failed`)
        res.status(401)
        res.send('something wrong [auth-2]')
      }
    } catch (e) {
      if (e.response && e.response.status === 401) {
        const { status, data } = e.response
        console.log(`Check auth ${req.originalUrl} verify sso account unauthorized`)
        console.log(data.error)
        logger.error(`Check auth ${req.originalUrl} verify sso account unauthorized`)
        logger.error(data.error)
        res.status(status)
        res.send({
          status,
          data: data.error
        })
      } else {
        console.log(`Check auth ${req.originalUrl} something wrong verify sso account`)
        logger.error(`Check auth ${req.originalUrl} something wrong verify sso account`)
        res.status(400)
        res.send('something wrong [auth]')
      }
    }
  } else {
    console.log(`Check auth ${req.originalUrl} not found "Authorization" in header`)
    logger.error(`Check auth ${req.originalUrl} not found "Authorization" in header`)
    res.status(401)
    res.send('not Authorization')
  }
}

const checkToken = async (req, res, next) => {
  if (typeof req.body.account !== 'undefined') {
    try {
      const emailStringList = req.body.account.split('@')
      const currentUser = emailStringList[0]
      if (currentUser) {
        const userInfo = await userModel.getUserRole(currentUser)
        let role = 'guest'
        let name = ''
        let bu = 'OTHER'
        let email = req.body.account
        if (userInfo && userInfo.recordset.length > 0) {
          const currentUser = userInfo.recordset[0]

          role = currentUser.role === 'A' ? 'admin' : 'user'
          name = currentUser.name
          bu = currentUser.bu
          email = currentUser.email
        }

        const validateSSo = {
          role: '',
          name: '',
          ssoAccount: '',
          employee: [],
          isValid: true,
          bu: bu
        }

        validateSSo.role = role
        validateSSo.name = name
        validateSSo.ssoAccount = email

        res.data = validateSSo
        console.log(`Check token is passed`)
        console.log(validateSSo)
        logger.info(`Check token is passed`)
        next()
      }
    } catch (e) {
      console.log(`Check token something wrong`)
      console.log(e)
      logger.error(`Check token something wrong`)
      logger.error(e.message)
      res.status(401)
      res.send('something wrong [check-auth-2]')
    }
  } else {
    console.log(`Check token not found "account" in body`)
    logger.error(`Check token not found "account" in body`)
    res.status(401)
    res.send('something wrong [check-auth-1]')
  }
}

router.post('/checktoken', checkAuth, checkToken, responseHandle.responseDataJson)
router.post('/account', function (req, res) {
  let SSOToken = ''
  // If Login type is SCG, Use AD Authen
  if (req.body && req.body.type === 'SCG') {
    // Build POST request to get Authentication Token from MDM (Master Data Management)
    var data = qs.stringify({
      'grant_type': 'password'
    });
    var config = {
      method: 'post',
      url: 'https://scgchem-mdmdev.scg.com/oauth/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'ApplicationId': 'd341870a-2442-42b7-8b0e-f0e07d5794c7',
        'SecretKey': '8c0a1df8-c2a8-4bdb-92d6-dec8c9be6e0f'
      },
      data: data
    };

    // Request Authentication Token
    axios(config)
      .then(function (body) {
        if (body && body.data && body.data.access_token) {
          SSOToken = body.data.access_token
          // Verify AD User, AD Password, and received token
          var SSOConfig = {
            method: 'post',
            url: 'https://scgchem-mdmdev.scg.com/v1.1/Api/SSO/SSOVerify',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
              'ssoAccount': req.body.userName,
              'ssoPassword': req.body.password,
              'ssoAccountType': 0, // AD
              'referenceToken': SSOToken
            }
          };

          axios(SSOConfig)
            .then(function (SSOData) {
              if (SSOData && SSOData.data && SSOData.data.responseData) {
                const SSOResponse = SSOData.data.responseData.ssoAccountType
                if (SSOResponse === 0) {
                  res.send(SSOData.data.responseData)
                } else {
                  res.send({ error: 'Invalid Credential' })
                }
              }
              else {
                res.send({ error: 'Invalid Request' })
              }
            })
            .catch(function (err) {
              console.log(err)
              const erfail = { error: 'request fail [auth -401]' }
              res.send(erfail)
            })
        }
      })
      .catch(function (err) {
        console.log(err)
        const erth = { error: 'request fail [auth -402]' }
        res.send(erth)
      })
  }
})
router.use('/v1', checkAuth, v1)

module.exports = router
