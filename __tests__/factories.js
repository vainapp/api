import faker from '@faker-js/faker'
import { factory } from 'factory-girl'

import generateRandomCode from '../src/shared/helpers/generateRandomCode'
import EmailVerificationLink from '../src/modules/users/infra/sequelize/models/EmailVerificationLink'
import ForgotPasswordCode from '../src/modules/users/infra/sequelize/models/ForgotPasswordCode'
import User from '../src/modules/users/infra/sequelize/models/User'
import Address from '../src/modules/users/infra/sequelize/models/Address'
import PhoneNumberVerificationCode from '../src/modules/users/infra/sequelize/models/PhoneNumberVerificationCode'
import ProfilePhoto from '../src/modules/users/infra/sequelize/models/ProfilePhoto'

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
  verified: false,
})

factory.define('PhoneNumberVerificationCode', PhoneNumberVerificationCode, {
  user_id: factory.assoc('User', 'id'),
  code: generateRandomCode(),
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

factory.define('ProfilePhoto', ProfilePhoto, {
  user_id: factory.assoc('User', 'id'),
  name: faker.system.fileName(),
  size: faker.datatype.number(),
  key: faker.system.fileName(),
  url: faker.internet.url(),
})

export default factory
