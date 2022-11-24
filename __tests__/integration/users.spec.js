import request from 'supertest'
import bcrypt from 'bcrypt'
import faker from '@faker-js/faker'

import factory from '../factories'
import truncate from '../util/truncate'
import closeRedisConnection from '../util/closeRedisConnection'
import EmailVerificationLink from '../../src/modules/users/infra/sequelize/models/EmailVerificationLink'
import app from '../../src/shared/infra/http/app'

describe('POST /users', () => {
  beforeEach(async () => {
    await truncate()
  })

  afterAll(async () => {
    await closeRedisConnection()
  })

  it('should not allow a sign-up with different passwords', async () => {
    const body = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      phone_number: faker.phone.phoneNumber(),
      genre: 'other',
      password: faker.internet.password(),
      passwordConfirmation: faker.internet.password(),
      address: {
        street: faker.address.streetName(),
        number: String(faker.datatype.number()),
        complement: faker.address.secondaryAddress(),
        district: faker.address.county(),
        city: faker.address.city(),
        state: faker.address.state(),
        zip_code: faker.address.zipCode(),
        country: faker.address.country(),
      },
    }

    await request(app).post('/users').send(body).expect(400)
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
      phone_number: faker.phone.phoneNumber(),
      genre: 'other',
      password,
      passwordConfirmation: password,
      address: {
        street: faker.address.streetName(),
        number: String(faker.datatype.number()),
        complement: faker.address.secondaryAddress(),
        district: faker.address.county(),
        city: faker.address.city(),
        state: faker.address.state(),
        zip_code: faker.address.zipCode(),
        country: faker.address.country(),
      },
    }

    const response = await request(app).post('/users').send(body)

    expect(response.body).toHaveProperty('id')
  })

  it('should not allow sign up users with already verified email addresses', async () => {
    const email = faker.internet.email()
    const password = faker.internet.password()

    await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
      email,
    })

    const body = {
      name: faker.name.findName(),
      email,
      phone_number: faker.phone.phoneNumber(),
      genre: 'other',
      password,
      passwordConfirmation: password,
      address: {
        street: faker.address.streetName(),
        number: String(faker.datatype.number()),
        complement: faker.address.secondaryAddress(),
        district: faker.address.county(),
        city: faker.address.city(),
        state: faker.address.state(),
        zip_code: faker.address.zipCode(),
        country: faker.address.country(),
      },
    }

    await request(app).post('/users').send(body).expect(403)
  })

  it('should generate an unverified EmailVerificationLink for the new user', async () => {
    const password = faker.internet.password()

    const body = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      phone_number: faker.phone.phoneNumber(),
      genre: 'other',
      password,
      passwordConfirmation: password,
      address: {
        street: faker.address.streetName(),
        number: String(faker.datatype.number()),
        complement: faker.address.secondaryAddress(),
        district: faker.address.county(),
        city: faker.address.city(),
        state: faker.address.state(),
        zip_code: faker.address.zipCode(),
        country: faker.address.country(),
      },
    }

    const response = await request(app).post('/users').send(body)

    const newEmailVerificationLink = await EmailVerificationLink.findOne({
      where: {
        user_id: response.body.id,
      },
    })

    expect(newEmailVerificationLink.verified).toBe(false)
  })

  it('should not allow sign ups with different passwords', async () => {
    await request(app)
      .post('/users')
      .send({
        name: faker.name.findName(),
        email: faker.internet.email(),
        phone_number: faker.phone.phoneNumber(),
        genre: 'other',
        password: faker.internet.password(),
        passwordConfirmation: faker.internet.password(),
        address: {
          street: faker.address.streetName(),
          number: String(faker.datatype.number()),
          complement: faker.address.secondaryAddress(),
          district: faker.address.county(),
          city: faker.address.city(),
          state: faker.address.state(),
          zip_code: faker.address.zipCode(),
          country: faker.address.country(),
        },
      })
      .expect(400)
  })

  it('should allow a second attempt to sign up from an unverified email address', async () => {
    const user = await factory.create('User')
    const password = faker.internet.password()

    const response = await request(app)
      .post('/users')
      .send({
        name: user.name,
        email: user.email,
        phone_number: faker.phone.phoneNumber(),
        genre: 'other',
        password,
        passwordConfirmation: password,
        address: {
          street: faker.address.streetName(),
          number: String(faker.datatype.number()),
          complement: faker.address.secondaryAddress(),
          district: faker.address.county(),
          city: faker.address.city(),
          state: faker.address.state(),
          zip_code: faker.address.zipCode(),
          country: faker.address.country(),
        },
      })

    expect(response.body).toHaveProperty('id')
  })
})
