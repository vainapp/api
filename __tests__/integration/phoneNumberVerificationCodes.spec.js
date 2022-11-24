import request from 'supertest'
import { v4 as uuidV4 } from 'uuid'

import faker from '@faker-js/faker'
import app from '../../src/shared/infra/http/app'
import factory from '../factories'
import truncate from '../util/truncate'
import closeRedisConnection from '../util/closeRedisConnection'
import User from '../../src/modules/users/infra/sequelize/models/User'
import PhoneNumberVerificationCode from '../../src/modules/users/infra/sequelize/models/PhoneNumberVerificationCode'

describe('POST /verify-phone-number', () => {
  beforeEach(async () => {
    await truncate()
  })

  afterAll(async () => {
    await closeRedisConnection()
  })

  it('should not allow request with invalid user ids', async () => {
    const response = await request(app)
      .post('/users/verify-phone-number')
      .send({
        user_id: uuidV4(),
        code: String(faker.datatype.number({ max: 9999 })),
      })
      .expect(404)

    expect(response.body.error.message).toBe('Código de verificação inválido')
  })

  it('should not allow request with invalid code', async () => {
    const user = await factory.create('User')

    const response = await request(app)
      .post('/users/verify-phone-number')
      .send({
        user_id: user.id,
        code: String(faker.datatype.number({ max: 9999 })),
      })
      .expect(404)

    expect(response.body.error.message).toBe('Código de verificação inválido')
  })

  it('should not return an error if the code is already verified', async () => {
    const user = await factory.create('User')
    const code = await factory.create('PhoneNumberVerificationCode', {
      user_id: user.id,
      verified: true,
    })

    await request(app)
      .post('/users/verify-phone-number')
      .send({
        user_id: user.id,
        code: code.code,
      })
      .expect(200)
  })

  it('should set a code as verified alongside the user.phone_number_verified to true', async () => {
    const user = await factory.create('User')
    const code = await factory.create('PhoneNumberVerificationCode', {
      user_id: user.id,
    })

    await request(app).post('/users/verify-phone-number').send({
      user_id: user.id,
      code: code.code,
    })

    const codeFromDb = await PhoneNumberVerificationCode.findByPk(code.id)
    const userFromDb = await User.findByPk(user.id)

    expect(codeFromDb.verified).toBeTruthy()
    expect(userFromDb.phone_number_verified).toBeTruthy()
  })
})
