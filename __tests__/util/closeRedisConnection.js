import Queue from '../../src/shared/lib/Queue'

export default async function closeRedisConnection() {
  await Queue.closeConnections()
}
