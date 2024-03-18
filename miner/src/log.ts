import * as fs from 'fs';
import { Logger, ILogObj } from 'tslog';

let log: Logger<ILogObj>;

export function initializeLogger(log_path: string | null, minLevel: number = 0) {
  log = new Logger({
    minLevel,
  });

  if (log_path != null) {
    log.attachTransport((lobj) => {
      const fileNameWithLine = lobj._meta.path?.fileNameWithLine || '[fileNameWithLine undefined]';
      const logMessage = lobj._meta.logLevelName;
      const timestamp = lobj._meta.date.getTime();

      const additionalData = Object.entries(lobj)
        .filter(([key]) => !isNaN(Number(key)))
        .map(([_, value]) => value)
        .join('\t');

      const logEntry = `${timestamp} ${logMessage} ${fileNameWithLine} ${additionalData}\n`;

      fs.appendFile(log_path, logEntry, (err) => {
        if (err) {
          console.error('Error writing log to file:', err);
        }
      });
    });
  }
}

export { log };