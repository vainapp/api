import path from 'node:path'

import faker from '@faker-js/faker'
import bcrypt from 'bcrypt'
import request from 'supertest'
import { v4 as uuidV4 } from 'uuid'

import ProfilePhoto from '../../src/modules/users/infra/sequelize/models/ProfilePhoto'
import User from '../../src/modules/users/infra/sequelize/models/User'
import app from '../../src/shared/infra/http/app'
import EmailVerificationLink from '../../src/shared/infra/sequelize/models/EmailVerificationLink'
import ForgotPasswordCode from '../../src/shared/infra/sequelize/models/ForgotPasswordCode'
import PhoneNumberVerificationCode from '../../src/shared/infra/sequelize/models/PhoneNumberVerificationCode'
import factory from '../factories'
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

describe('POST /users', () => {
  it('should not allow a sign-up with different passwords', async () => {
    const body = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      phone_number: faker.phone.phoneNumber(),
      genre: 'other',
      password: faker.internet.password(),
      password_confirmation: faker.internet.password(),
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
      password_confirmation: password,
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
      password_confirmation: password,
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
      password_confirmation: password,
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
        password_confirmation: faker.internet.password(),
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
        password_confirmation: password,
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

describe('GET /users/verify-email/:email_verification_link_id', () => {
  it('should not allow verify an invalid link', async () => {
    await request(app).get(`/users/verify-email/${uuidV4()}`).expect(404)
  })

  it('should set a link and a user as verified after verification', async () => {
    const user = await factory.create('User', {
      phone_number_verified: true,
    })
    const emailVerificationLink = await factory.create(
      'EmailVerificationLink',
      { user_id: user.id }
    )

    await request(app).get(`/users/verify-email/${emailVerificationLink.id}`)

    const linkFromDb = await EmailVerificationLink.findByPk(
      emailVerificationLink.id
    )
    const userFromDb = await User.findByPk(linkFromDb.user_id)

    expect(linkFromDb.verified).toBeTruthy()
    expect(userFromDb.verified).toBeTruthy()
  })

  it('should allow verify links twice', async () => {
    const link = await factory.create('EmailVerificationLink', {
      verified: true,
    })

    await request(app).get(`/users/verify-email/${link.id}`).expect(302)
  })
})

describe('POST /users/verify-email/resend', () => {
  it('should not allow resend verification link for an invalid email', async () => {
    await request(app)
      .post('/users/verify-email/resend')
      .send({ email: faker.internet.email() })
      .expect(404)
  })

  it('should not allow resend verification link for a verified email', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: false,
    })

    await request(app)
      .post('/users/verify-email/resend')
      .send({ email: user.email })
      .expect(403)
  })

  it('should not allow resend verification link when there is no unverified link', async () => {
    const user = await factory.create('User', {
      email_verified: false,
      phone_number_verified: false,
    })

    await request(app)
      .post('/users/verify-email/resend')
      .send({ email: user.email })
      .expect(404)
  })

  it('should allow resend verification link when there is an unverified link', async () => {
    const user = await factory.create('User', {
      email_verified: false,
      phone_number_verified: false,
    })

    await factory.create('EmailVerificationLink', {
      user_id: user.id,
      verified: false,
    })

    await request(app)
      .post('/users/verify-email/resend')
      .send({ email: user.email })
      .expect(200)
  })
})

describe('POST /users/verify-phone-number', () => {
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

describe('POST /users/verify-phone-number/resend', () => {
  it('should not allow resend verification sms for an invalid email', async () => {
    await request(app)
      .post('/users/verify-phone-number/resend')
      .send({ email: faker.internet.email() })
      .expect(404)
  })

  it('should not allow resend verification sms for a verified phone number', async () => {
    const user = await factory.create('User', {
      email_verified: false,
      phone_number_verified: true,
    })

    await request(app)
      .post('/users/verify-phone-number/resend')
      .send({ email: user.email })
      .expect(403)
  })

  it('should not allow resend verification sms when there is no unverified code', async () => {
    const user = await factory.create('User', {
      email_verified: false,
      phone_number_verified: false,
    })

    await request(app)
      .post('/users/verify-phone-number/resend')
      .send({ email: user.email })
      .expect(404)
  })

  it('should allow resend verification sms when there is an unverified code', async () => {
    const user = await factory.create('User', {
      email_verified: false,
      phone_number_verified: false,
    })

    await factory.create('PhoneNumberVerificationCode', {
      user_id: user.id,
      verified: false,
    })

    await request(app)
      .post('/users/verify-phone-number/resend')
      .send({ email: user.email })
      .expect(200)
  })
})

describe('POST /users/profile-photo', () => {
  it('should not be able to send a request if the user is not authenticated', async () => {
    await request(app).post('/users/profile-photo').expect(401)
  })

  it('should be able to create a profile photo', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    const sessionResponse = await request(app).post('/users/sessions').send({
      email: user.email,
      password: user.password,
    })

    const response = await request(app)
      .post('/users/profile-photo')
      .set('Authorization', `Bearer ${sessionResponse.body.access_token}`)
      .attach('file', path.resolve(__dirname, '..', 'util', 'test.jpg'))
      .expect(200)

    expect(response.body).toHaveProperty('id')
  })

  it('should not be able to delete an invalid profile photo id', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    const sessionResponse = await request(app).post('/users/sessions').send({
      email: user.email,
      password: user.password,
    })

    const response = await request(app)
      .delete(`/users/profile-photo/${uuidV4()}`)
      .set('Authorization', `Bearer ${sessionResponse.body.access_token}`)
      .expect(404)

    expect(response.body.error.message).toBe('Imagem de perfil não encontrada')
  })

  it('should not be able to delete a profile image that does not belong to the user', async () => {
    const user1 = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })
    const user2 = await factory.create('User', {
      email: faker.internet.email(),
      email_verified: true,
      phone_number_verified: true,
    })

    const session1Response = await request(app).post('/users/sessions').send({
      email: user1.email,
      password: user1.password,
    })
    const session2Response = await request(app).post('/users/sessions').send({
      email: user2.email,
      password: user2.password,
    })

    const uploadResponse = await request(app)
      .post('/users/profile-photo')
      .set('Authorization', `Bearer ${session1Response.body.access_token}`)
      .attach('file', path.resolve(__dirname, '..', 'util', 'test.jpg'))

    const response = await request(app)
      .delete(`/users/profile-photo/${uploadResponse.body.id}`)
      .set('Authorization', `Bearer ${session2Response.body.access_token}`)
      .expect(404)

    expect(response.body.error.message).toBe('Imagem de perfil não encontrada')
  })

  it('should be able to delete a profile photo', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    const sessionResponse = await request(app).post('/users/sessions').send({
      email: user.email,
      password: user.password,
    })

    const uploadResponse = await request(app)
      .post('/users/profile-photo')
      .set('Authorization', `Bearer ${sessionResponse.body.access_token}`)
      .attach('file', path.resolve(__dirname, '..', 'util', 'test.jpg'))

    await request(app)
      .delete(`/users/profile-photo/${uploadResponse.body.id}`)
      .set('Authorization', `Bearer ${sessionResponse.body.access_token}`)
      .expect(200)

    const profilePhotoFromDb = await ProfilePhoto.findByPk(
      uploadResponse.body.id
    )

    expect(profilePhotoFromDb).toBeNull()
  })
})

describe('GET /users/me', () => {
  it('should not allow a request if the user is not authenticated', async () => {
    await request(app).get('/users/me').expect(401)
  })

  it('should be able to get the user data', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    const sessionResponse = await request(app).post('/users/sessions').send({
      email: user.email,
      password: user.password,
    })

    const response = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${sessionResponse.body.access_token}`)
      .expect(200)

    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('email')
    expect(response.body).toHaveProperty('email_verified')
    expect(response.body).toHaveProperty('phone_number')
    expect(response.body).toHaveProperty('phone_number_verified')
    expect(response.body).toHaveProperty('name')
    expect(response.body).toHaveProperty('genre')
    expect(response.body).toHaveProperty('addresses')
    expect(response.body).toHaveProperty('profile_photo')
    expect(response.body).toHaveProperty('created_at')
  })
})

describe('PUT /users/change-password', () => {
  it('should not allow a request if the user is not authenticated', async () => {
    const password = faker.internet.password()

    await request(app)
      .put('/users/change-password')
      .send({
        current_password: password,
        new_password: password,
        new_password_confirmation: password,
      })
      .expect(401)
  })

  it('should not be able to change password with different new passwords', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    const sessionResponse = await request(app).post('/users/sessions').send({
      email: user.email,
      password: user.password,
    })

    const response = await request(app)
      .put('/users/change-password')
      .set('Authorization', `Bearer ${sessionResponse.body.access_token}`)
      .send({
        current_password: user.password,
        new_password: faker.internet.password(),
        new_password_confirmation: faker.internet.password(),
      })
      .expect(400)

    expect(response.body.error.message).toBe('As senhas não conferem')
  })

  it('should not be able to change password with an invalid current password', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    const sessionResponse = await request(app).post('/users/sessions').send({
      email: user.email,
      password: user.password,
    })

    const response = await request(app)
      .put('/users/change-password')
      .set('Authorization', `Bearer ${sessionResponse.body.access_token}`)
      .send({
        current_password: faker.internet.password(),
        new_password: faker.internet.password(),
        new_password_confirmation: faker.internet.password(),
      })
      .expect(403)

    expect(response.body.error.message).toBe('Senha atual incorreta')
  })

  it('should be able to change password', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    const sessionResponse = await request(app).post('/users/sessions').send({
      email: user.email,
      password: user.password,
    })

    const new_password = faker.internet.password()

    await request(app)
      .put('/users/change-password')
      .set('Authorization', `Bearer ${sessionResponse.body.access_token}`)
      .send({
        current_password: user.password,
        new_password,
        new_password_confirmation: new_password,
      })
      .expect(200)

    await request(app)
      .post('/users/sessions')
      .send({
        email: user.email,
        password: new_password,
      })
      .expect(200)
  })
})

describe('POST /users/sessions', () => {
  it('should resend the verifications steps when trying to authenticate with an unverified user', async () => {
    const user = await factory.create('User')

    const response = await request(app)
      .post('/users/sessions')
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(200)

    expect(response.body).toHaveProperty('needs_verification')
    expect(response.body.needs_verification).toBe(true)
  })

  it('should not allow a verified user to sign-in with invalid credentials', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    await request(app)
      .post('/users/sessions')
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
      .post('/users/sessions')
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

    const response = await request(app).post('/users/sessions').send({
      email: user.email,
      password: user.password,
    })

    expect(response.body).toHaveProperty('user')
    expect(response.body).toHaveProperty('access_token')
    expect(response.body).toHaveProperty('refresh_token')
  })
})

describe('POST /users/sessions/refresh', () => {
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

  it('should not allow a user to refresh a token with an invalid refresh_token', async () => {
    await request(app)
      .post('/users/sessions/refresh')
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
      .post('/users/sessions')
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(200)

    const now = new Date()
    jest.setSystemTime(now.setMonth(now.getMonth() + 2))

    await request(app)
      .post('/users/sessions/refresh')
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
      .post('/users/sessions')
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(200)

    const response = await request(app)
      .post('/users/sessions/refresh')
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
      .post('/users/sessions')
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(200)

    await request(app)
      .post('/users/sessions/refresh')
      .send({
        refresh_token: body.access_token,
      })
      .expect(403)
  })
})

describe('POST /users/passwords/forgot-password', () => {
  it('should not allow an unverified user to recover password', async () => {
    const user = await factory.create('User')

    await request(app)
      .post('/users/passwords/forgot')
      .send({
        email: user.email,
      })
      .expect(404)
  })

  it('should generate a ForgotPasswordCode for an user', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    await request(app).post('/users/passwords/forgot').send({
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

    await request(app).post('/users/passwords/forgot').send({
      email: user.email,
    })

    const firstForgotPasswordCode = await ForgotPasswordCode.findOne({
      where: {
        user_id: user.id,
      },
    })

    expect(firstForgotPasswordCode.active).toBeTruthy()

    await request(app).post('/users/passwords/forgot').send({
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

describe('POST /users/passwords/verify', () => {
  it('should not allow an unverified user to recover password', async () => {
    const user = await factory.create('User')

    await request(app)
      .post('/users/passwords/verify')
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
      .post('/users/passwords/verify')
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

    const response = await request(app).post('/users/passwords/verify').send({
      email: user.email,
      code: code.code,
    })

    expect(response.body).toHaveProperty('token')
  })
})

describe('POST /users/passwords/reset', () => {
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
      .post('/users/passwords/reset')
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
      .post('/users/passwords/reset')
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
      .post('/users/passwords/reset')
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
      .post('/users/passwords/reset')
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

    await request(app).post('/users/passwords/reset').send({
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
