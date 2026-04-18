const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}] ${message}`)
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => `${timestamp} [${level}] ${message}`)
      )
    }),
    new DailyRotateFile({
      filename: 'logs/%DATE%/server.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d'
    })
  ]
});

// Stream interface for morgan — trims the trailing newline morgan appends
const morganStream = {
  write: (message) => logger.info(message.trim())
};

module.exports = { logger, morganStream };
