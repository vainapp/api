import Queue from '../../src/shared/lib/Queue'
import CacheService from '../../src/shared/services/CacheService'

export async function closeQueueRedisConnection() {
  await Queue.closeConnections()
}

export async function closeRedisConnection() {
  await CacheService.closeConnection()
}
