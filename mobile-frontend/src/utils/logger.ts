export const logger = {
  log: (...args: any[]) => __DEV__ && console.log(...args),
  error: (...args: any[]) => __DEV__ && console.error(...args),
  warn: (...args: any[]) => __DEV__ && console.warn(...args),
};
