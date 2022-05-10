import Queue from '../../src/lib/Queue'

export default async function closeRedisConnection() {
  await Queue.closeConnections()
}
