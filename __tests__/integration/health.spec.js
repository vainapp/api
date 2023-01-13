import request from 'supertest'

import app from '../../src/shared/infra/http/app'
import {
  closeQueueRedisConnection,
  closeRedisConnection,
} from '../util/closeRedisConnections'
import truncate from '../util/truncate'

afterAll(async () => {
  await closeRedisConnection()
  await closeQueueRedisConnection()
})

beforeEach(async () => {
  await truncate()
})

describe('GET /health', () => {
  it('should return status 200', async () => {
    await request(app).get('/health').expect(200)
  })
})
