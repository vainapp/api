import path from 'node:path'
import request from 'supertest'
import bcrypt from 'bcrypt'
import faker from '@faker-js/faker'
import { v4 as uuidV4 } from 'uuid'

import factory from '../factories'
import truncate from '../util/truncate'
import closeRedisConnection from '../util/closeRedisConnection'
import EmailVerificationLink from '../../src/modules/users/infra/sequelize/models/EmailVerificationLink'
import PhoneNumberVerificationCode from '../../src/modules/users/infra/sequelize/models/PhoneNumberVerificationCode'
import User from '../../src/modules/users/infra/sequelize/models/User'
import app from '../../src/shared/infra/http/app'
import ProfilePhoto from '../../src/modules/users/infra/sequelize/models/ProfilePhoto'

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

describe('GET /users/verify-email/:email_verification_link_id', () => {
  beforeEach(async () => {
    await truncate()
  })

  afterAll(async () => {
    await closeRedisConnection()
  })

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

describe('POST /users/verify-phone-number', () => {
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

describe('POST /users/profile-photo', () => {
  beforeEach(async () => {
    await truncate()
  })

  afterAll(async () => {
    await closeRedisConnection()
  })

  it('should not be able to send a request if the user is not authenticated', async () => {
    await request(app).post('/users/profile-photo').expect(401)
  })

  it('should be able to create a profile photo', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    const sessionResponse = await request(app).post('/sessions').send({
      email: user.email,
      password: user.password,
    })

    const response = await request(app)
      .post('/users/profile-photo')
      .set('Authorization', `Bearer ${sessionResponse.body.token}`)
      .attach('file', path.resolve(__dirname, '..', 'util', 'test.jpg'))
      .expect(200)

    expect(response.body).toHaveProperty('id')
  })

  it('should not be able to delete an invalid profile photo id', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    const sessionResponse = await request(app).post('/sessions').send({
      email: user.email,
      password: user.password,
    })

    const response = await request(app)
      .delete(`/users/profile-photo/${uuidV4()}`)
      .set('Authorization', `Bearer ${sessionResponse.body.token}`)
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

    const session1Response = await request(app).post('/sessions').send({
      email: user1.email,
      password: user1.password,
    })
    const session2Response = await request(app).post('/sessions').send({
      email: user2.email,
      password: user2.password,
    })

    const uploadResponse = await request(app)
      .post('/users/profile-photo')
      .set('Authorization', `Bearer ${session1Response.body.token}`)
      .attach('file', path.resolve(__dirname, '..', 'util', 'test.jpg'))

    const response = await request(app)
      .delete(`/users/profile-photo/${uploadResponse.body.id}`)
      .set('Authorization', `Bearer ${session2Response.body.token}`)
      .expect(404)

    expect(response.body.error.message).toBe('Imagem de perfil não encontrada')
  })

  it('should be able to delete a profile photo', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    const sessionResponse = await request(app).post('/sessions').send({
      email: user.email,
      password: user.password,
    })

    const uploadResponse = await request(app)
      .post('/users/profile-photo')
      .set('Authorization', `Bearer ${sessionResponse.body.token}`)
      .attach('file', path.resolve(__dirname, '..', 'util', 'test.jpg'))

    await request(app)
      .delete(`/users/profile-photo/${uploadResponse.body.id}`)
      .set('Authorization', `Bearer ${sessionResponse.body.token}`)
      .expect(200)

    const profilePhotoFromDb = await ProfilePhoto.findByPk(
      uploadResponse.body.id
    )

    expect(profilePhotoFromDb).toBeNull()
  })
})

describe('GET /users/me', () => {
  beforeEach(async () => {
    await truncate()
  })

  afterAll(async () => {
    await closeRedisConnection()
  })

  it('should not allow a request if the user is not authenticated', async () => {
    await request(app).get('/users/me').expect(401)
  })

  it('should be able to get the user data', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    const sessionResponse = await request(app).post('/sessions').send({
      email: user.email,
      password: user.password,
    })

    const response = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${sessionResponse.body.token}`)
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
  beforeEach(async () => {
    await truncate()
  })

  afterAll(async () => {
    await closeRedisConnection()
  })

  it('should not allow a request if the user is not authenticated', async () => {
    const password = faker.internet.password()

    await request(app)
      .put('/users/change-password')
      .send({
        currentPassword: password,
        newPassword: password,
        newPasswordConfirmation: password,
      })
      .expect(401)
  })

  it('should not be able to change password with different new passwords', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    const sessionResponse = await request(app).post('/sessions').send({
      email: user.email,
      password: user.password,
    })

    const response = await request(app)
      .put('/users/change-password')
      .set('Authorization', `Bearer ${sessionResponse.body.token}`)
      .send({
        currentPassword: user.password,
        newPassword: faker.internet.password(),
        newPasswordConfirmation: faker.internet.password(),
      })
      .expect(400)

    expect(response.body.error.message).toBe('As senhas não conferem')
  })

  it('should not be able to change password with an invalid current password', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    const sessionResponse = await request(app).post('/sessions').send({
      email: user.email,
      password: user.password,
    })

    const response = await request(app)
      .put('/users/change-password')
      .set('Authorization', `Bearer ${sessionResponse.body.token}`)
      .send({
        currentPassword: faker.internet.password(),
        newPassword: faker.internet.password(),
        newPasswordConfirmation: faker.internet.password(),
      })
      .expect(403)

    expect(response.body.error.message).toBe('Senha atual incorreta')
  })

  it('should be able to change password', async () => {
    const user = await factory.create('User', {
      email_verified: true,
      phone_number_verified: true,
    })

    const sessionResponse = await request(app).post('/sessions').send({
      email: user.email,
      password: user.password,
    })

    const newPassword = faker.internet.password()

    await request(app)
      .put('/users/change-password')
      .set('Authorization', `Bearer ${sessionResponse.body.token}`)
      .send({
        currentPassword: user.password,
        newPassword,
        newPasswordConfirmation: newPassword,
      })
      .expect(200)

    await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: newPassword,
      })
      .expect(200)
  })
})
