import morgan, { StreamOptions } from "morgan";
import winston, { level } from "winston";

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const colors = { error: 'red', warn: 'yellow', info: 'green', http: 'magenta', debug: 'white' };

winston.addColors(colors);

const transports = [
    new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
            winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
        ),
     }),
     new winston.transports.File({
        filename: 'logs/all.log',
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
            winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
        ),
     }),
     new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
            winston.format.colorize({ all: true }),
            winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
        ),
     }),
];

export const Logger = winston.createLogger({
    levels,
    transports,
});

const stream: StreamOptions ={
    write: (message) => Logger.http(message),
};

export const morganMiddleware = morgan(':method :url :res[content-length] - :response-time ms', {
    stream
});