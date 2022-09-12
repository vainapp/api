import request from 'supertest'
import bcrypt from 'bcrypt'
import faker from '@faker-js/faker'

import app from '../../src/shared/infra/http/app'
import factory from '../factories'
import truncate from '../util/truncate'
import closeRedisConnection from '../util/closeRedisConnection'
import AccountVerificationLink from '../../src/modules/users/infra/sequelize/models/AccountVerificationLink'

describe('POST /users', () => {
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

  it('should not allow sign up users with already verified email addresses', async () => {
    const email = faker.internet.email()
    const password = faker.internet.password()

    await factory.create('User', {
      verified: true,
      email,
    })

    const body = {
      name: faker.name.findName(),
      email,
      password,
      passwordConfirmation: password,
    }

    await request(app).post('/users').send(body).expect(403)
  })

  it('should generate an unverified AccountVerificationLink for the new user', async () => {
    const password = faker.internet.password()

    const body = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password,
      passwordConfirmation: password,
    }

    const response = await request(app).post('/users').send(body)

    const newAccountVerificationLink = await AccountVerificationLink.findOne({
      where: {
        user_id: response.body.id,
      },
    })

    expect(newAccountVerificationLink.verified).toBe(false)
  })

  it('should not allow sign ups with different passwords', async () => {
    await request(app)
      .post('/users')
      .send({
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        passwordConfirmation: faker.internet.password(),
      })
      .expect(400)
  })

  it('should allow a second attempt to sign up from an unverified email address', async () => {
    const user = await factory.create('User')
    const password = faker.internet.password()

    const response = await request(app).post('/users').send({
      name: user.name,
      email: user.email,
      password,
      passwordConfirmation: password,
    })

    expect(response.body).toHaveProperty('id')
  })
})
