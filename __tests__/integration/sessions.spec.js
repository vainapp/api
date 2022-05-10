import request from 'supertest'
import faker from '@faker-js/faker'

import app from '../../src/app'
import factory from '../factories'
import truncate from '../util/truncate'
import closeRedisConnection from '../util/closeRedisConnection'

describe('POST /sessions', () => {
  beforeEach(async () => {
    await truncate()
  })

  afterAll(async () => {
    await closeRedisConnection()
  })

  it('should not allow an unverified user to sign-in', async () => {
    const user = await factory.create('User')

    await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(403)
  })

  it('should not allow a verified user to sign-in with invalid credentials', async () => {
    const user = await factory.create('User', {
      verified: true,
    })

    await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: faker.internet.password(),
      })
      .expect(403)
  })

  it('should allow a verified user to sign-in with correct credentials', async () => {
    const user = await factory.create('User', {
      verified: true,
    })

    const response = await request(app).post('/sessions').send({
      email: user.email,
      password: user.password,
    })

    expect(response.body).toHaveProperty('user')
    expect(response.body).toHaveProperty('token')
  })
})
