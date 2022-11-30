import Redis from 'ioredis'
import redisConfig from '../../config/redis'

class CacheService {
  constructor() {
    this.client = new Redis(redisConfig)
  }

  async save(key, value, ttl = redisConfig.expirations.staticData) {
    await this.client.set(key, JSON.stringify(value), 'EX', ttl)
  }

  async recover(key) {
    const data = await this.client.get(key)

    if (!data) {
      return null
    }

    const parsedData = JSON.parse(data)

    return parsedData
  }

  async invalidate(key) {
    await this.client.del(key)
  }

  async invalidatePrefix(prefix) {
    const keys = await this.client.keys(`${prefix}:*`)

    const pipeline = this.client.pipeline()

    keys.forEach((key) => {
      pipeline.del(key)
    })

    await pipeline.exec()
  }

  async closeConnection() {
    await new Promise((resolve) => this.client.quit(resolve))
    await new Promise((resolve) => setImmediate(resolve))
  }
}

export default new CacheService()
