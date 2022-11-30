export const LONG_TERM_DATA_DURATION = 1 * 60 * 60 * 24 * 30 // 30 days

export default {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  ...(process.env.NODE_ENV === 'test'
    ? {}
    : {
        password: process.env.REDIS_PASSWORD,
      }),
  expirations: {
    staticData: 1 * 60 * 60 * 12, // 12 hours
  },
}
