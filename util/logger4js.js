const log4js = require("log4js");
var dateFormat = require('dateformat')
var curDate = new Date()

log4js.configure({
  appenders: {
    fileAppender: {
      pattern: "yyyy-MM-dd-hh",
      type: 'multiFile',
      base: './logs/',
      property: 'curDate',
      extension: '.log',
      maxLogSize: 10485760,
      backups: 3,
      compress: true
    },
  },
  categories: {
    default: { appenders: ["fileAppender"], level: "debug" },
  },
});

const logger = log4js.getLogger();
logger.addContext('curDate', dateFormat(curDate, 'yyyy-mm-dd'));

module.exports = logger