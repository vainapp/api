import request from 'supertest'
import bcrypt from 'bcrypt'

import app from '../../src/app'
import factory from '../factories'
import truncate from '../util/truncate'

describe('/users', () => {
  beforeEach(async () => {
    await truncate()
  })

  it('should pass', () => {
    expect(1).toBe(2)
  })
})
