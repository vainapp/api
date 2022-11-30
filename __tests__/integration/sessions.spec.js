import request from 'supertest'
import faker from '@faker-js/faker'

import app from '../../src/shared/infra/http/app'
import factory from '../factories'
import truncate from '../util/truncate'
import {
  closeQueueRedisConnection,
  closeRedisConnection,
} from '../util/closeRedisConnections'

afterAll(async () => {
  await closeRedisConnection()
})

describe('POST /sessions', () => {
  beforeEach(async () => {
    await truncate()
  })

  afterAll(async () => {
    await closeQueueRedisConnection()
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
      email_verified: true,
      phone_number_verified: true,
    })

    await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: faker.internet.password(),
      })
      .expect(403)
  })

  it('should not allow to use the refresh_token as a valid token', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    const { body } = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(200)

    await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${body.refresh_token}`)
      .expect(403)
  })

  it('should allow a verified user to sign-in with correct credentials', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    const response = await request(app).post('/sessions').send({
      email: user.email,
      password: user.password,
    })

    expect(response.body).toHaveProperty('user')
    expect(response.body).toHaveProperty('access_token')
    expect(response.body).toHaveProperty('refresh_token')
  })
})

describe('POST /sessions/refresh', () => {
  jest.useFakeTimers({
    doNotFake: [
      'nextTick',
      'setImmediate',
      'clearImmediate',
      'setInterval',
      'clearInterval',
      'setTimeout',
      'clearTimeout',
    ],
  })

  beforeEach(async () => {
    await truncate()
  })

  afterAll(async () => {
    await closeQueueRedisConnection()
  })

  it('should not allow a user to refresh a token with an invalid refresh_token', async () => {
    await request(app)
      .post('/sessions/refresh')
      .send({
        refresh_token: faker.datatype.uuid(),
      })
      .expect(403)
  })

  it('should not allow a user to refresh a token with an expired refresh_token', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    const { body } = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(200)

    jest.setSystemTime(new Date('2023-01-01'))

    await request(app)
      .post('/sessions/refresh')
      .send({
        refresh_token: body.refresh_token,
      })
      .expect(403)
  })

  it('should allow a user to refresh a token with a valid refresh_token', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    const { body } = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(200)

    const response = await request(app)
      .post('/sessions/refresh')
      .send({
        refresh_token: body.refresh_token,
      })
      .expect(200)

    expect(response.body).toHaveProperty('user')
    expect(response.body).toHaveProperty('access_token')
    expect(response.body).toHaveProperty('refresh_token')
  })

  it('should not allow a user to refresh a token using an access token', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    const { body } = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(200)

    await request(app)
      .post('/sessions/refresh')
      .send({
        refresh_token: body.access_token,
      })
      .expect(403)
  })
})
