import faker from '@faker-js/faker'
import { factory } from 'factory-girl'

import Company from '../src/modules/companies/infra/sequelize/models/Company'
import Employee from '../src/modules/companies/infra/sequelize/models/Employee'
import EmployeeRole from '../src/modules/companies/infra/sequelize/models/EmployeeRole'
import Franchise from '../src/modules/companies/infra/sequelize/models/Franchise'
import FranchiseEmployee from '../src/modules/companies/infra/sequelize/models/FranchiseEmployee'
import Address from '../src/modules/users/infra/sequelize/models/Address'
import ForgotPasswordCode from '../src/modules/users/infra/sequelize/models/ForgotPasswordCode'
import ProfilePhoto from '../src/modules/users/infra/sequelize/models/ProfilePhoto'
import User from '../src/modules/users/infra/sequelize/models/User'
import generateRandomCode from '../src/shared/helpers/generateRandomCode'
import EmailVerificationLink from '../src/shared/infra/sequelize/models/EmailVerificationLink'
import PhoneNumberVerificationCode from '../src/shared/infra/sequelize/models/PhoneNumberVerificationCode'

factory.define('User', User, {
  name: faker.name.findName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  genre: 'other',
  phone_number: faker.phone.phoneNumber(),
  email_verified: false,
  phone_number_verified: false,
  profile_photo_id: null,
})

factory.define('EmailVerificationLink', EmailVerificationLink, {
  user_id: factory.assoc('User', 'id'),
  employee_id: factory.assoc('Employee', 'id'),
  verified: false,
})

factory.define('ForgotPasswordCode', ForgotPasswordCode, {
  user_id: factory.assoc('User', 'id'),
  code: generateRandomCode(),
  active: true,
})

factory.define('Address', Address, {
  user_id: factory.assoc('User', 'id'),
  street: faker.address.streetName(),
  number: faker.datatype.number(),
  complement: faker.address.secondaryAddress(),
  district: faker.address.county(),
  city: faker.address.city(),
  state: faker.address.state(),
  zip_code: faker.address.zipCode(),
  country: faker.address.country(),
})

factory.define('PhoneNumberVerificationCode', PhoneNumberVerificationCode, {
  user_id: factory.assoc('User', 'id'),
  employee_id: factory.assoc('Employee', 'id'),
  code: generateRandomCode(),
  verified: false,
})

factory.define('ProfilePhoto', ProfilePhoto, {
  user_id: factory.assoc('User', 'id'),
  name: faker.system.fileName(),
  size: faker.datatype.number(),
  key: faker.system.fileName(),
  url: faker.internet.url(),
})

factory.define('Employee', Employee, {
  name: faker.name.findName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  phone_number: faker.phone.phoneNumber(),
  email_verified: false,
  phone_number_verified: false,
})

factory.define('Company', Company, {
  name: faker.name.findName(),
  admin_id: factory.assoc('Employee', 'id'),
  product_id: null,
  price_id: null,
  customer_id: null,
  subscription_active_until: null,
})

factory.define('EmployeeRole', EmployeeRole, {
  role: faker.helpers.arrayElement(['ADMIN', 'MANAGER', 'EMPLOYEE']),
  employee_id: factory.assoc('Employee', 'id'),
})

factory.define('Franchise', Franchise, {
  role: faker.helpers.arrayElement(['ADMIN', 'MANAGER', 'EMPLOYEE']),
  employee_id: factory.assoc('Employee', 'id'),
  company_id: factory.assoc('Company', 'id'),
})

factory.define('FranchiseEmployee', FranchiseEmployee, {
  employee_id: factory.assoc('Employee', 'id'),
  franchise_id: factory.assoc('Franchise', 'id'),
})

export default factory
