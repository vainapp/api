import request from 'supertest'
import { v4 as uuidV4 } from 'uuid'

import app from '../../src/app'
import factory from '../factories'
import truncate from '../util/truncate'
import closeRedisConnection from '../util/closeRedisConnection'
import AccountVerificationLink from '../../src/app/models/AccountVerificationLink'
import User from '../../src/app/models/User'

describe('POST /users', () => {
  beforeEach(async () => {
    await truncate()
  })

  afterAll(async () => {
    await closeRedisConnection()
  })

  it('should not allow verify an invalid link', async () => {
    await request(app).get(`/verify/${uuidV4()}`).expect(404)
  })

  it('should set a link and a user as verified after verification', async () => {
    const accountVerificationLink = await factory.create(
      'AccountVerificationLink'
    )

    await request(app).get(`/verify/${accountVerificationLink.id}`)

    const linkFromDb = await AccountVerificationLink.findByPk(
      accountVerificationLink.id
    )
    const user = await User.findByPk(linkFromDb.user_id)

    expect(linkFromDb.verified).toBeTruthy()
    expect(user.verified).toBeTruthy()
  })

  it('should not allow verify links twice', async () => {
    const link = await factory.create('AccountVerificationLink', {
      verified: true,
    })

    await request(app).get(`/verify/${link.id}`).expect(403)
  })
})
