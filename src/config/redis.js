export default {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  expirations: {
    staticData: 1 * 60 * 60 * 12, // 12 hours
  },
}
