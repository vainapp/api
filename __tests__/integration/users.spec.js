import request from 'supertest'
import bcrypt from 'bcrypt'
import faker from '@faker-js/faker'

import app from '../../src/app'
import factory from '../factories'
import truncate from '../util/truncate'
import closeRedisConnection from '../util/closeRedisConnection'

describe('/users', () => {
  beforeEach(async () => {
    await truncate()
  })

  afterAll(async () => {
    await closeRedisConnection()
  })

  it('should encrypt user password when new user created', async () => {
    const password = 'mytest'

    const user = await factory.create('User', {
      password,
    })

    const compareHash = await bcrypt.compare(password, user.password_hash)

    expect(compareHash).toBe(true)
  })

  it('should be able to register', async () => {
    const password = faker.internet.password()

    const body = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password,
      passwordConfirmation: password,
    }

    const response = await request(app).post('/users').send(body)

    expect(response.body).toHaveProperty('id')
  })
})
