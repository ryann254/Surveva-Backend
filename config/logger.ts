import winston from 'winston';
import config from './config';

interface LoggingInfo {
  level: string;
  message: string;
}

const changeErrorFormat = winston.format((info: LoggingInfo) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const logger = winston.createLogger({
  level: config.nodeEnv === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    changeErrorFormat(),
    config.nodeEnv === 'development'
      ? winston.format.colorize()
      : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(
      (info: LoggingInfo) => `${info.level}: ${info.message}`
    )
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

export default logger;
