import faker from '@faker-js/faker'
import { factory } from 'factory-girl'

import generateRandomCode from '../src/helpers/generateRandomCode'
import AccountVerificationLink from '../src/app/models/AccountVerificationLink'
import ForgotPasswordCode from '../src/app/models/ForgotPasswordCode'
import User from '../src/app/models/User'

factory.define('User', User, {
  name: faker.name.findName(),
  email: faker.internet.email(),
  verified: false,
  password: faker.internet.password(),
})

factory.define('AccountVerificationLink', AccountVerificationLink, {
  verified: false,
  user_id: factory.assoc('User', 'id'),
})

factory.define('ForgotPasswordCode', ForgotPasswordCode, {
  user_id: factory.assoc('User', 'id'),
  code: generateRandomCode(),
  active: true,
})

export default factory
