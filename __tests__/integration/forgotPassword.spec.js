import request from 'supertest'

import app from '../../src/app'
import factory from '../factories'
import truncate from '../util/truncate'
import closeRedisConnection from '../util/closeRedisConnection'
import ForgotPasswordCode from '../../src/app/models/ForgotPasswordCode'

describe('POST /forgot-password', () => {
  beforeEach(async () => {
    await truncate()
  })

  afterAll(async () => {
    await closeRedisConnection()
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
      verified: true,
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
      verified: true,
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
