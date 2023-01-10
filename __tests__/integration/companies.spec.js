import querystring from 'node:querystring'

import faker from '@faker-js/faker'
import request from 'supertest'

import Company from '../../src/modules/companies/infra/sequelize/models/Company'
import Employee from '../../src/modules/companies/infra/sequelize/models/Employee'
import EmployeeRole from '../../src/modules/companies/infra/sequelize/models/EmployeeRole'
import buildDirectEmailParams from '../../src/shared/helpers/buildDirectEmailParams'
import app from '../../src/shared/infra/http/app'
import EmailVerificationLink from '../../src/shared/infra/sequelize/models/EmailVerificationLink'
import PhoneNumberVerificationCode from '../../src/shared/infra/sequelize/models/PhoneNumberVerificationCode'
import * as stripe from '../../src/shared/lib/Stripe'
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

describe('POST /companies', () => {
  it('should not allow create companies with different passwords', async () => {
    const body = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      password_confirmation: faker.internet.password(),
      company_name: faker.company.companyName(),
      phone_number: faker.phone.phoneNumber(),
      name: faker.name.firstName(),
      price_id: faker.datatype.uuid(),
    }

    await request(app).post('/companies').send(body).expect(400)
  })

  it("should update the admin's phone_number if there's already a try to sign up with the same email", async () => {
    const employee = await factory.create('Employee')
    const company = await factory.create('Company', {
      admin_id: employee.id,
    })

    const password = faker.internet.password()
    const body = {
      email: employee.email,
      password,
      password_confirmation: password,
      company_name: company.name,
      phone_number: faker.phone.phoneNumber(),
      name: employee.name,
      price_id: faker.datatype.uuid(),
    }

    await request(app).post('/companies').send(body)

    const employeeFromDatabase = await Employee.findByPk(employee.id)
    expect(employeeFromDatabase.phone_number).toBe(body.phone_number)
  })

  it('should not allow to create a company if the email address is already registered as an employee', async () => {
    const employee = await factory.create('Employee')

    const password = faker.internet.password()
    const body = {
      email: employee.email,
      password,
      password_confirmation: password,
      company_name: faker.company.companyName(),
      phone_number: faker.phone.phoneNumber(),
      name: faker.name.firstName(),
      price_id: faker.datatype.uuid(),
    }

    await request(app).post('/companies').send(body).expect(403)
  })

  it('should create a Employee, a Company and a EmployeeRole, then should generate a EmailVerificationLink', async () => {
    const password = faker.internet.password()
    const body = {
      email: faker.internet.email(),
      password,
      password_confirmation: password,
      company_name: faker.company.companyName(),
      phone_number: faker.phone.phoneNumber(),
      name: faker.name.firstName(),
      price_id: faker.datatype.uuid(),
    }

    await request(app).post('/companies').send(body)

    const employee = await Employee.findOne({
      where: {
        email: body.email,
      },
    })

    const company = await Company.findOne({
      where: {
        admin_id: employee.id,
      },
    })

    const employeeRole = await EmployeeRole.findOne({
      where: {
        employee_id: employee.id,
        role: 'ADMIN',
      },
    })

    const emailVerificationLink = await EmailVerificationLink.findOne({
      where: {
        employee_id: employee.id,
      },
    })

    expect(employee).toBeTruthy()
    expect(company).toBeTruthy()
    expect(employeeRole).toBeTruthy()
    expect(emailVerificationLink).toBeTruthy()
  })
})

describe('POST /companies/pre-signup', () => {
  it("should return 204 if there's no existing employee with the provided email address", async () => {
    const body = {
      email: faker.internet.email(),
      price_id: faker.datatype.uuid(),
    }

    await request(app).post('/companies/pre-signup').send(body).expect(204)
  })

  it('should return 403 if the email address is not from an admin employee', async () => {
    const employee = await factory.create('Employee')

    const body = {
      email: employee.email,
      price_id: faker.datatype.uuid(),
    }

    await request(app).post('/companies/pre-signup').send(body).expect(403)
  })

  it('should generate a EmailVerificationLink for an unverified admin email', async () => {
    const employee = await factory.create('Employee')
    await factory.create('Company', {
      admin_id: employee.id,
    })
    await factory.create('EmployeeRole', {
      employee_id: employee.id,
      role: 'ADMIN',
    })

    const body = {
      email: employee.email,
      price_id: faker.datatype.uuid(),
    }

    const response = await request(app)
      .post('/companies/pre-signup')
      .send(body)
      .expect(200)

    const emailVerificationLink = await EmailVerificationLink.findOne({
      where: {
        employee_id: employee.id,
      },
    })

    expect(emailVerificationLink).toBeTruthy()
    expect(response.body).toHaveProperty('verified')
    expect(response.body).toHaveProperty('checkout_url')
    expect(response.body.verified).toBe(false)
    expect(response.body.checkout_url).toBe(null)
  })

  it('should generate a checkout session for a verified admin email with no active subscription', async () => {
    const employee = await factory.create('Employee', {
      email_verified: true,
      phone_number_verified: true,
    })
    const company = await factory.create('Company', {
      admin_id: employee.id,
      customer_id: faker.datatype.uuid(),
    })
    await factory.create('EmployeeRole', {
      employee_id: employee.id,
      role: 'ADMIN',
    })
    const url = faker.internet.url()

    const body = {
      email: employee.email,
      price_id: faker.datatype.uuid(),
    }

    const spy = jest
      .spyOn(stripe, 'generateCheckoutSession')
      .mockResolvedValue({
        url,
      })

    const response = await request(app)
      .post('/companies/pre-signup')
      .send(body)
      .expect(200)

    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      price_id: body.price_id,
      company_id: company.id,
      customer_id: company.customer_id,
    })
    expect(response.body).toHaveProperty('verified')
    expect(response.body).toHaveProperty('checkout_url')
    expect(response.body.verified).toBe(true)
    expect(response.body.checkout_url).toBe(url)
  })

  it('should return 403 if the email is admin, verified and the company has an active subscription', async () => {
    const employee = await factory.create('Employee', {
      email_verified: true,
      phone_number_verified: true,
    })
    await factory.create('Company', {
      admin_id: employee.id,
      customer_id: faker.datatype.uuid(),
      subscription_active_until: faker.date.future(),
    })
    await factory.create('EmployeeRole', {
      employee_id: employee.id,
      role: 'ADMIN',
    })

    const body = {
      email: employee.email,
      price_id: faker.datatype.uuid(),
    }

    await request(app).post('/companies/pre-signup').send(body).expect(403)
  })
})

describe('GET /companies/verify-email/:email_verification_link_id', () => {
  it("should return 400 if there's no price_id in the query params", async () => {
    const employee = await factory.create('Employee')
    await factory.create('Company', {
      admin_id: employee.id,
    })
    await factory.create('EmployeeRole', {
      employee_id: employee.id,
      role: 'ADMIN',
    })
    const emailVerificationLink = await factory.create(
      'EmailVerificationLink',
      {
        user_id: null,
        employee_id: employee.id,
      }
    )

    await request(app)
      .get(`/companies/verify-email/${emailVerificationLink.id}`)
      .expect(400)
  })

  it("should return 404 if there's no existing EmailVerificationLink", async () => {
    await request(app)
      .get(
        `/companies/verify-email/${faker.datatype.uuid()}?price_id=${
          faker.datatype.uuid
        }`
      )
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
      .get(
        `/companies/verify-email/${emailVerificationLink.id}?price_id=${faker.datatype.uuid}`
      )
      .expect(404)
  })

  it('should redirect (302) if the phone_number is already verified', async () => {
    const employee = await factory.create('Employee', {
      phone_number_verified: true,
    })
    await factory.create('Company', {
      admin_id: employee.id,
    })
    await factory.create('EmployeeRole', {
      employee_id: employee.id,
      role: 'ADMIN',
    })
    const emailVerificationLink = await factory.create(
      'EmailVerificationLink',
      {
        user_id: null,
        employee_id: employee.id,
      }
    )
    const price_id = faker.datatype.uuid()

    await request(app)
      .get(
        `/companies/verify-email/${emailVerificationLink.id}?price_id=${price_id}`
      )
      .expect(302)
      .expect(
        'Location',
        `${
          process.env.APP_WEB_URL
        }/company-email-verified?${querystring.stringify({
          price_id,
          employee_id: employee.id,
          needs_sms_verification: false,
        })}`
      )
  })

  it('should generate a PhoneNumberVerificationCode after verifying a EmailVerificationLink', async () => {
    const employee = await factory.create('Employee')
    await factory.create('Company', {
      admin_id: employee.id,
    })
    await factory.create('EmployeeRole', {
      employee_id: employee.id,
      role: 'ADMIN',
    })
    const emailVerificationLink = await factory.create(
      'EmailVerificationLink',
      {
        user_id: null,
        employee_id: employee.id,
      }
    )
    const price_id = faker.datatype.uuid()

    await request(app)
      .get(
        `/companies/verify-email/${emailVerificationLink.id}?price_id=${price_id}`
      )
      .expect(302)
      .expect(
        'Location',
        `${
          process.env.APP_WEB_URL
        }/company-email-verified?${querystring.stringify({
          price_id,
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
    await factory.create('Company', {
      admin_id: employee.id,
    })
    await factory.create('EmployeeRole', {
      employee_id: employee.id,
      role: 'ADMIN',
    })
    const emailVerificationLink = await factory.create(
      'EmailVerificationLink',
      {
        user_id: null,
        employee_id: employee.id,
        verified: true,
      }
    )
    const price_id = faker.datatype.uuid()

    await request(app)
      .get(
        `/companies/verify-email/${emailVerificationLink.id}?price_id=${price_id}`
      )
      .expect(302)
      .expect(
        'Location',
        `${
          process.env.APP_WEB_URL
        }/company-email-verified?${querystring.stringify({
          price_id,
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

describe('GET /companies/verify-phone-number', () => {
  it('should return 404 if the employee does not exist', async () => {
    await request(app)
      .post('/companies/verify-phone-number')
      .send({
        employee_id: faker.datatype.uuid(),
        code: faker.datatype.number({ min: 1000, max: 9999 }).toString(),
      })
      .expect(404)
  })

  it('should return 404 if there is no existing PhoneNumberVerificationCode', async () => {
    const employee = await factory.create('Employee')

    await request(app)
      .post('/companies/verify-phone-number')
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
      .post('/companies/verify-phone-number')
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

    const spy = jest.spyOn(stripe, 'findOrCreateCustomer').mockResolvedValue({
      customer_id: faker.datatype.uuid(),
    })

    await request(app)
      .post('/companies/verify-phone-number')
      .send({
        employee_id: employee.id,
        code: phoneNumberVerificationCode.code,
      })
      .expect(200)

    await phoneNumberVerificationCode.reload()
    await employee.reload()
    expect(phoneNumberVerificationCode.verified).toBeTruthy()
    expect(employee.phone_number_verified).toBeTruthy()
    expect(spy).toHaveBeenCalledTimes(1)
  })
})

describe('POST /companies/verify-email/resend', () => {
  it('should return 404 if the employee does not exist', async () => {
    await request(app)
      .post('/companies/verify-email/resend')
      .send({
        email: faker.internet.email(),
        price_id: faker.datatype.uuid(),
      })
      .expect(404)
  })

  it('should return 403 if the email address is already verified', async () => {
    const employee = await factory.create('Employee', {
      email_verified: true,
    })

    await request(app)
      .post('/companies/verify-email/resend')
      .send({
        email: employee.email,
        price_id: faker.datatype.uuid(),
      })
      .expect(403)
  })

  it('should return 404 if there is no existing peding EmailVerificationLink', async () => {
    const employee = await factory.create('Employee')
    await factory.create('EmailVerificationLink', {
      user_id: null,
      employee_id: employee.id,
      verified: true,
    })

    await request(app)
      .post('/companies/verify-email/resend')
      .send({
        email: employee.email,
        price_id: faker.datatype.uuid(),
      })
      .expect(404)
  })

  it('should keep price_id and send an EmailVerificationLink', async () => {
    const employee = await factory.create('Employee')
    const emailVerificationLink = await factory.create(
      'EmailVerificationLink',
      {
        user_id: null,
        employee_id: employee.id,
      }
    )
    const price_id = faker.datatype.uuid()

    const spy = jest.spyOn(buildDirectEmailParams, 'call')

    await request(app)
      .post('/companies/verify-email/resend')
      .send({
        email: employee.email,
        price_id,
      })
      .expect(200)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenNthCalledWith(1, undefined, {
      toAddress: employee.email,
      template: 'COMPANY_VERIFY_EMAIL',
      templateData: {
        name: employee.name,
        link: `${process.env.API_URL}/companies/verify-email/${
          emailVerificationLink.id
        }?${querystring.stringify({ price_id })}`,
      },
    })
  })
})

describe('POST /companies/verify-phone-number/resend', () => {
  it('should return 404 if the employee does not exist', async () => {
    await request(app)
      .post('/companies/verify-phone-number/resend')
      .send({
        email: faker.internet.email(),
      })
      .expect(404)
  })

  it('should return 403 if the phone_number is already verified', async () => {
    const employee = await factory.create('Employee', {
      phone_number_verified: true,
    })

    await request(app)
      .post('/companies/verify-phone-number/resend')
      .send({
        email: employee.email,
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
      .post('/companies/verify-phone-number/resend')
      .send({
        email: employee.email,
      })
      .expect(404)
  })
})

describe('POST /companies/payments/checkout-session', () => {
  it('should return 404 if the employee does not exist', async () => {
    await request(app)
      .post('/companies/payments/checkout-session')
      .send({
        employee_id: faker.datatype.uuid(),
        price_id: faker.datatype.uuid(),
      })
      .expect(404)
  })

  it('should return 403 if the employee is not verified', async () => {
    const employee = await factory.create('Employee')

    await request(app)
      .post('/companies/payments/checkout-session')
      .send({
        employee_id: employee.id,
        price_id: faker.datatype.uuid(),
      })
      .expect(403)
  })

  it('should return 403 if the employee is not admin', async () => {
    const employee = await factory.create('Employee', {
      email_verified: true,
      phone_number_verified: true,
    })
    await factory.create('EmployeeRole', {
      employee_id: employee.id,
      role: 'MANAGER',
    })

    await request(app)
      .post('/companies/payments/checkout-session')
      .send({
        employee_id: employee.id,
        price_id: faker.datatype.uuid(),
      })
      .expect(403)
  })

  it('should return 404 if there is not a company', async () => {
    const employee = await factory.create('Employee', {
      email_verified: true,
      phone_number_verified: true,
    })
    await factory.create('EmployeeRole', {
      employee_id: employee.id,
      role: 'ADMIN',
    })

    await request(app)
      .post('/companies/payments/checkout-session')
      .send({
        employee_id: employee.id,
        price_id: faker.datatype.uuid(),
      })
      .expect(404)
  })

  it('should generate a checkout session if everything is as expected', async () => {
    const employee = await factory.create('Employee', {
      email_verified: true,
      phone_number_verified: true,
    })
    await factory.create('EmployeeRole', {
      employee_id: employee.id,
      role: 'ADMIN',
    })
    const company = await factory.create('Company', {
      admin_id: employee.id,
      customer_id: faker.datatype.uuid(),
    })
    const url = faker.internet.url()
    const price_id = faker.datatype.uuid()

    const spy = jest
      .spyOn(stripe, 'generateCheckoutSession')
      .mockResolvedValue({
        url,
      })

    const response = await request(app)
      .post('/companies/payments/checkout-session')
      .send({
        employee_id: employee.id,
        price_id,
      })
      .expect(200)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      price_id,
      company_id: company.id,
      customer_id: company.customer_id,
    })
    expect(response.body).toHaveProperty('checkout_url')
    expect(response.body.checkout_url).toBe(url)
  })
})
