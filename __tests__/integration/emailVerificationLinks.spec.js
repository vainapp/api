import request from 'supertest'
import { v4 as uuidV4 } from 'uuid'

import app from '../../src/shared/infra/http/app'
import factory from '../factories'
import truncate from '../util/truncate'
import closeRedisConnection from '../util/closeRedisConnection'
import EmailVerificationLink from '../../src/modules/users/infra/sequelize/models/EmailVerificationLink'
import User from '../../src/modules/users/infra/sequelize/models/User'

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
    const emailVerificationLink = await factory.create('EmailVerificationLink')

    await request(app).get(`/users/verify-email/${emailVerificationLink.id}`)

    const linkFromDb = await EmailVerificationLink.findByPk(
      emailVerificationLink.id
    )
    const user = await User.findByPk(linkFromDb.user_id)

    expect(linkFromDb.verified).toBeTruthy()
    expect(user.verified).toBeTruthy()
  })

  it('should allow verify links twice', async () => {
    const link = await factory.create('EmailVerificationLink', {
      verified: true,
    })

    await request(app).get(`/users/verify-email/${link.id}`).expect(302)
  })
})
