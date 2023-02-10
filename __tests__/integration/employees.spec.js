import querystring from 'node:querystring'

import faker from '@faker-js/faker'
import request from 'supertest'

import app from '../../src/shared/infra/http/app'
import Employee from '../../src/shared/infra/sequelize/models/Employee'
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

describe('GET /employees/verify-email/:email_verification_link_id', () => {
  it("should return 404 if there's no existing EmailVerificationLink", async () => {
    await request(app)
      .get(`/employees/verify-email/${faker.datatype.uuid()}`)
      .expect(404)
  })

  it('should return 404 if the EmailVerificationLink references a user instead of a employee', async () => {
    const emailVerificationLink = await factory.create(
      'EmailVerificationLink',
      {
        employee_id: null,
      }
    )

    await request(app)
      .get(`/employees/verify-email/${emailVerificationLink.id}`)
      .expect(404)
  })

  it('should redirect (302) if the phone_number is already verified', async () => {
    const employee = await factory.create('Employee', {
      phone_number_verified: true,
    })
    const emailVerificationLink = await factory.create(
      'EmailVerificationLink',
      {
        employee_id: employee.id,
      }
    )

    await request(app)
      .get(`/employees/verify-email/${emailVerificationLink.id}`)
      .expect(302)
      .expect(
        'Location',
        `${
          process.env.APP_WEB_URL
        }/employee-email-verified?${querystring.stringify({
          employee_id: employee.id,
          needs_sms_verification: false,
        })}`
      )
  })

  it('should generate a PhoneNumberVerificationCode after verifying a EmailVerificationLink', async () => {
    const employee = await factory.create('Employee')
    const emailVerificationLink = await factory.create(
      'EmailVerificationLink',
      {
        employee_id: employee.id,
      }
    )

    await request(app)
      .get(`/employees/verify-email/${emailVerificationLink.id}`)
      .expect(302)
      .expect(
        'Location',
        `${
          process.env.APP_WEB_URL
        }/employee-email-verified?${querystring.stringify({
          employee_id: employee.id,
          needs_sms_verification: true,
        })}`
      )

    const phoneNumberVerificationCode =
      await PhoneNumberVerificationCode.findOne({
        where: {
          employee_id: employee.id,
        },
      })

    const updatedEmployee = await Employee.findByPk(employee.id)

    expect(phoneNumberVerificationCode).toBeTruthy()
    expect(updatedEmployee.email_verified).toBeTruthy()
  })

  it('should redirect to SMS code verification page even if the EmailVerificationLink is already verified', async () => {
    const employee = await factory.create('Employee')
    const emailVerificationLink = await factory.create(
      'EmailVerificationLink',
      {
        employee_id: employee.id,
        verified: true,
      }
    )

    await request(app)
      .get(`/employees/verify-email/${emailVerificationLink.id}`)
      .expect(302)
      .expect(
        'Location',
        `${
          process.env.APP_WEB_URL
        }/employee-email-verified?${querystring.stringify({
          employee_id: employee.id,
          needs_sms_verification: true,
        })}`
      )

    const phoneNumberVerificationCode =
      await PhoneNumberVerificationCode.findOne({
        where: {
          employee_id: employee.id,
        },
      })

    expect(phoneNumberVerificationCode).toBeTruthy()
  })
})

describe('POST /employees/verify-email/resend', () => {
  it('should return 404 if the employee does not exist', async () => {
    await request(app)
      .post('/employees/verify-email/resend')
      .send({
        email: faker.internet.email(),
      })
      .expect(404)
  })

  it('should return 403 if the email address is already verified', async () => {
    const employee = await factory.create('Employee', {
      email_verified: true,
    })

    await request(app)
      .post('/employees/verify-email/resend')
      .send({
        email: employee.email,
      })
      .expect(403)
  })

  it('should return 404 if there is no existing peding EmailVerificationLink', async () => {
    const employee = await factory.create('Employee')
    await factory.create('EmailVerificationLink', {
      employee_id: employee.id,
      verified: true,
    })

    await request(app)
      .post('/employees/verify-email/resend')
      .send({
        email: employee.email,
      })
      .expect(404)
  })
})

describe('GET /employees/verify-phone-number', () => {
  it('should return 404 if the employee does not exist', async () => {
    await request(app)
      .post('/employees/verify-phone-number')
      .send({
        employee_id: faker.datatype.uuid(),
        code: faker.datatype.number({ min: 1000, max: 9999 }).toString(),
      })
      .expect(404)
  })

  it('should return 404 if there is no existing PhoneNumberVerificationCode', async () => {
    const employee = await factory.create('Employee')

    await request(app)
      .post('/employees/verify-phone-number')
      .send({
        employee_id: employee.id,
        code: faker.datatype.number({ min: 1000, max: 9999 }).toString(),
      })
      .expect(404)
  })

  it('should return 200 if the PhoneNumberVerificationCode is already verified', async () => {
    const employee = await factory.create('Employee')
    const phoneNumberVerificationCode = await factory.create(
      'PhoneNumberVerificationCode',
      {
        employee_id: employee.id,
        verified: true,
      }
    )

    await request(app)
      .post('/employees/verify-phone-number')
      .send({
        employee_id: employee.id,
        code: phoneNumberVerificationCode.code,
      })
      .expect(200)
  })

  it('should update the existing code to verified', async () => {
    const employee = await factory.create('Employee')
    const phoneNumberVerificationCode = await factory.create(
      'PhoneNumberVerificationCode',
      {
        employee_id: employee.id,
      }
    )

    await request(app)
      .post('/employees/verify-phone-number')
      .send({
        employee_id: employee.id,
        code: phoneNumberVerificationCode.code,
      })
      .expect(200)

    await phoneNumberVerificationCode.reload()
    await employee.reload()
    expect(phoneNumberVerificationCode.verified).toBeTruthy()
    expect(employee.phone_number_verified).toBeTruthy()
  })
})

describe('POST /employees/verify-phone-number/resend', () => {
  it('should return 404 if the employee does not exist', async () => {
    await request(app)
      .post('/employees/verify-phone-number/resend')
      .send({
        employee_id: faker.datatype.uuid(),
      })
      .expect(404)
  })

  it('should return 403 if the phone_number is already verified', async () => {
    const employee = await factory.create('Employee', {
      phone_number_verified: true,
    })

    await request(app)
      .post('/employees/verify-phone-number/resend')
      .send({
        employee_id: employee.id,
      })
      .expect(403)
  })

  it('should return 404 if there is no existing pending PhoneNumberVerificationCode', async () => {
    const employee = await factory.create('Employee')
    await factory.create('PhoneNumberVerificationCode', {
      user_id: null,
      employee_id: employee.id,
      verified: true,
    })

    await request(app)
      .post('/employees/verify-phone-number/resend')
      .send({
        employee_id: employee.id,
      })
      .expect(404)
  })
})

describe('POST /employees/sessions', () => {
  it('should not allow an unverified employee to sign-in', async () => {
    const employee = await factory.create('Employee')

    await request(app)
      .post('/employees/sessions')
      .send({
        email: employee.email,
        password: employee.password,
      })
      .expect(403)
  })

  it('should not allow a verified employee to sign-in with invalid credentials', async () => {
    const user = await factory.create('Employee', {
      email_verified: true,
      phone_number_verified: true,
    })

    await request(app)
      .post('/employees/sessions')
      .send({
        email: user.email,
        password: faker.internet.password(),
      })
      .expect(403)
  })

  it('should not allow to use the refresh_token as a valid token', async () => {
    const employee = await factory.create('Employee', {
      email_verified: true,
      phone_number_verified: true,
    })

    const { body } = await request(app)
      .post('/employees/sessions')
      .send({
        email: employee.email,
        password: employee.password,
      })
      .expect(200)

    await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${body.refresh_token}`)
      .expect(403)
  })

  it('should allow a verified employee to sign-in with correct credentials', async () => {
    const employee = await factory.create('Employee', {
      email_verified: true,
      phone_number_verified: true,
    })

    const response = await request(app).post('/employees/sessions').send({
      email: employee.email,
      password: employee.password,
    })

    expect(response.body).toHaveProperty('employee')
    expect(response.body).toHaveProperty('access_token')
    expect(response.body).toHaveProperty('refresh_token')
  })
})

describe('POST /employees/sessions/refresh', () => {
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

  it('should not allow a employee to refresh a token with an invalid refresh_token', async () => {
    await request(app)
      .post('/employees/sessions/refresh')
      .send({
        refresh_token: faker.datatype.uuid(),
      })
      .expect(403)
  })

  it('should not allow a employee to refresh a token with an expired refresh_token', async () => {
    const employee = await factory.create('Employee', {
      email_verified: true,
      phone_number_verified: true,
    })

    const { body } = await request(app)
      .post('/employees/sessions')
      .send({
        email: employee.email,
        password: employee.password,
      })
      .expect(200)

    const now = new Date()
    jest.setSystemTime(now.setMonth(now.getMonth() + 2))

    await request(app)
      .post('/employees/sessions/refresh')
      .send({
        refresh_token: body.refresh_token,
      })
      .expect(403)
  })

  it('should allow a employee to refresh a token with a valid refresh_token', async () => {
    const employee = await factory.create('Employee', {
      email_verified: true,
      phone_number_verified: true,
    })

    const { body } = await request(app)
      .post('/employees/sessions')
      .send({
        email: employee.email,
        password: employee.password,
      })
      .expect(200)

    const response = await request(app)
      .post('/employees/sessions/refresh')
      .send({
        refresh_token: body.refresh_token,
      })
      .expect(200)

    expect(response.body).toHaveProperty('employee')
    expect(response.body).toHaveProperty('access_token')
    expect(response.body).toHaveProperty('refresh_token')
  })

  it('should not allow a user to refresh a token using an access token', async () => {
    const employee = await factory.create('Employee', {
      email_verified: true,
      phone_number_verified: true,
    })

    const { body } = await request(app)
      .post('/employees/sessions')
      .send({
        email: employee.email,
        password: employee.password,
      })
      .expect(200)

    await request(app)
      .post('/employees/sessions/refresh')
      .send({
        refresh_token: body.access_token,
      })
      .expect(403)
  })
})

/**
 * TODO: Implement more tests for this route
 */
describe('POST /employees', () => {
  it('should not allow to create a employee if the user is not an admin or a manager', async () => {
    const employee = await factory.create('Employee')

    const { body } = await request(app).post('/employees/sessions').send({
      email: employee.email,
      password: employee.password,
    })

    await request(app)
      .post('/employees')
      .set('Authorization', `Bearer ${body.access_token}`)
      .send({
        name: faker.name.findName(),
        email: faker.internet.email(),
        phone_number: faker.phone.phoneNumber(),
        roles: [faker.helpers.arrayElement(['ADMIN', 'MANAGER'])],
        franchises_ids: [faker.datatype.uuid()],
      })
      .expect(403)
  })

  it('should not allow to create a employee if the user is an admin or a manager but not verified', async () => {
    const employee = await factory.create('Employee', {
      email_verified: false,
      phone_number_verified: false,
    })

    await factory.create('EmployeeRole', {
      employee_id: employee.id,
      role: 'ADMIN',
    })

    const { body } = await request(app).post('/employees/sessions').send({
      email: employee.email,
      password: employee.password,
    })

    await request(app)
      .post('/employees')
      .set('Authorization', `Bearer ${body.access_token}`)
      .send({
        name: faker.name.findName(),
        email: faker.internet.email(),
        phone_number: faker.phone.phoneNumber(),
        roles: [faker.helpers.arrayElement(['ADMIN', 'MANAGER'])],
        franchises_ids: [faker.datatype.uuid()],
      })
      .expect(403)
  })

  it('should not allow to create a employee if the email is already in use', async () => {
    const employee = await factory.create('Employee', {
      email_verified: true,
      phone_number_verified: true,
    })

    await factory.create('EmployeeRole', {
      employee_id: employee.id,
      role: 'ADMIN',
    })

    const { body } = await request(app).post('/employees/sessions').send({
      email: employee.email,
      password: employee.password,
    })

    await request(app)
      .post('/employees')
      .set('Authorization', `Bearer ${body.access_token}`)
      .send({
        name: faker.name.findName(),
        email: employee.email,
        phone_number: faker.phone.phoneNumber(),
        roles: [faker.helpers.arrayElement(['ADMIN', 'MANAGER'])],
        franchises_ids: [faker.datatype.uuid()],
      })
      .expect(403)
  })
})
