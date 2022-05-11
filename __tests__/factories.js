import faker from '@faker-js/faker'
import { factory } from 'factory-girl'
import AccountVerificationLink from '../src/app/models/AccountVerificationLink'

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

export default factory
