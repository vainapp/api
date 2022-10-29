import faker from '@faker-js/faker'
import { factory } from 'factory-girl'

import generateRandomCode from '../src/shared/helpers/generateRandomCode'
import EmailVerificationLink from '../src/modules/users/infra/sequelize/models/EmailVerificationLink'
import ForgotPasswordCode from '../src/modules/users/infra/sequelize/models/ForgotPasswordCode'
import User from '../src/modules/users/infra/sequelize/models/User'
import Address from '../src/modules/users/infra/sequelize/models/Address'

factory.define('User', User, {
  name: faker.name.findName(),
  email: faker.internet.email(),
  verified: false,
  password: faker.internet.password(),
})

factory.define('EmailVerificationLink', EmailVerificationLink, {
  verified: false,
  user_id: factory.assoc('User', 'id'),
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
  district: faker.address.cityPrefix(),
  city: faker.address.city(),
  state: faker.address.state(),
  zip_code: faker.address.zipCode(),
  country: faker.address.country(),
})

export default factory
