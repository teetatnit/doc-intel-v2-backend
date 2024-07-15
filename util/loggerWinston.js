const winston = require('winston');
require('winston-daily-rotate-file');
const moment = require('moment');

const { combine, timestamp, label, printf } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  const timeStampFormat = moment(timestamp).format('YYYY-MM-DD hh:mm:ss');
  return `${timeStampFormat} [${level}] : ${message}`;
});

const transport = new winston.transports.DailyRotateFile({
  filename: './logs/log-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  // maxSize: '20m',
  maxFiles: '30d'
});

transport.on('rotate', function (oldFilename, newFilename) {
  // do something fun
});

// const levels = {
//   error: 0,
//   warn: 1,
//   info: 2,
//   http: 3,
//   verbose: 4,
//   debug: 5,
//   silly: 6
// };

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    label({ label: 'Document Analytics' }),
    timestamp(),
    myFormat
  ),
  transports: [
    transport
  ]
});

module.exports = logger
