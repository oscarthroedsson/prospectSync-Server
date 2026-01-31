import winston from "winston";
import { env } from "./env";

// Create Winston logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    env.NODE_ENV === "production"
      ? winston.format.json() // JSON format for production (easy to parse)
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ level, message, timestamp, ...meta }) => {
            const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : "";
            return `${timestamp} [${level}]: ${message} ${metaString}`;
          })
        )
  ),
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});

// Create a stream for morgan HTTP logging (if needed)
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
