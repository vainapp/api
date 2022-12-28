import faker from '@faker-js/faker'
import bcrypt from 'bcrypt'
import request from 'supertest'

import ForgotPasswordCode from '../../src/modules/users/infra/sequelize/models/ForgotPasswordCode'
import User from '../../src/modules/users/infra/sequelize/models/User'
import app from '../../src/shared/infra/http/app'
import factory from '../factories'
import {
  closeQueueRedisConnection,
  closeRedisConnection,
} from '../util/closeRedisConnections'
import truncate from '../util/truncate'

afterAll(async () => {
  await closeRedisConnection()
})

describe('POST /forgot-password', () => {
  beforeEach(async () => {
    await truncate()
  })

  afterAll(async () => {
    await closeQueueRedisConnection()
  })

  it('should not allow an unverified user to recover password', async () => {
    const user = await factory.create('User')

    await request(app)
      .post('/forgot-password')
      .send({
        email: user.email,
      })
      .expect(404)
  })

  it('should generate an ForgotPasswordCode for an user', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    await request(app).post('/forgot-password').send({
      email: user.email,
    })

    const forgotPasswordCode = await ForgotPasswordCode.findOne({
      where: {
        user_id: user.id,
      },
    })

    expect(forgotPasswordCode.active).toBeTruthy()
  })

  it('should invalidate a previous ForgotPasswordCode and generate a new active one for an user', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    await request(app).post('/forgot-password').send({
      email: user.email,
    })

    const firstForgotPasswordCode = await ForgotPasswordCode.findOne({
      where: {
        user_id: user.id,
      },
    })

    expect(firstForgotPasswordCode.active).toBeTruthy()

    await request(app).post('/forgot-password').send({
      email: user.email,
    })

    const newFirstForgotPasswordCode = await ForgotPasswordCode.findByPk(
      firstForgotPasswordCode.id
    )
    const secondForgotPasswordCode = await ForgotPasswordCode.findOne({
      where: {
        user_id: user.id,
        active: true,
      },
    })

    expect(newFirstForgotPasswordCode.active).toBeFalsy()
    expect(secondForgotPasswordCode.active).toBeTruthy()
  })
})

describe('POST /forgot-password/verify', () => {
  beforeEach(async () => {
    await truncate()
  })

  afterAll(async () => {
    await closeQueueRedisConnection()
  })

  it('should not allow an unverified user to recover password', async () => {
    const user = await factory.create('User')

    await request(app)
      .post('/forgot-password/verify')
      .send({
        email: user.email,
        code: String(faker.datatype.number({ min: 1000, max: 9999 })),
      })
      .expect(404)
  })

  it('should not allow to recover an account with an expired code', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })
    const code = await factory.create('ForgotPasswordCode', {
      active: false,
      user_id: user.id,
    })

    await request(app)
      .post('/forgot-password/verify')
      .send({
        email: user.email,
        code: code.code,
      })
      .expect(404)
  })

  it('should return the token if everything is as expected', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })
    const code = await factory.create('ForgotPasswordCode', {
      user_id: user.id,
    })

    const response = await request(app).post('/forgot-password/verify').send({
      email: user.email,
      code: code.code,
    })

    expect(response.body).toHaveProperty('token')
  })
})

describe('POST /forgot-password/reset', () => {
  beforeEach(async () => {
    await truncate()
  })

  afterAll(async () => {
    await closeQueueRedisConnection()
  })

  it('should not allow an expired code to change password', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })
    const code = await factory.create('ForgotPasswordCode', {
      user_id: user.id,
      active: false,
    })
    const password = faker.internet.password()

    await request(app)
      .post('/forgot-password/reset')
      .send({
        token: code.id,
        password,
        password_confirmation: password,
      })
      .expect(404)
  })

  it('should not allow to update a password when passwords do not match', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })
    const code = await factory.create('ForgotPasswordCode', {
      user_id: user.id,
    })

    await request(app)
      .post('/forgot-password/reset')
      .send({
        token: code.id,
        password: faker.internet.password(),
        password_confirmation: faker.internet.password(),
      })
      .expect(400)
  })

  it('should not allow an unverified user to update their password', async () => {
    const user = await factory.create('User')
    const code = await factory.create('ForgotPasswordCode', {
      user_id: user.id,
    })
    const password = faker.internet.password()

    await request(app)
      .post('/forgot-password/reset')
      .send({
        token: code.id,
        password,
        password_confirmation: password,
      })
      .expect(404)
  })

  it('should not allow an user to update their password providing different password', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })
    const code = await factory.create('ForgotPasswordCode', {
      user_id: user.id,
    })

    await request(app)
      .post('/forgot-password/reset')
      .send({
        token: code.id,
        password: faker.internet.password(),
        password_confirmation: faker.internet.password(),
      })
      .expect(400)
  })

  it("should change the user's password and invalidate a code", async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })
    const code = await factory.create('ForgotPasswordCode', {
      user_id: user.id,
    })
    const password = faker.internet.password()

    await request(app).post('/forgot-password/reset').send({
      token: code.id,
      password,
      password_confirmation: password,
    })

    const forgotPasswordCode = await ForgotPasswordCode.findByPk(code.id)
    const userFromDb = await User.findByPk(user.id)
    const passwordsMatch = await bcrypt.compare(
      password,
      userFromDb.password_hash
    )

    expect(forgotPasswordCode.active).toBeFalsy()
    expect(passwordsMatch).toBeTruthy()
  })
})
