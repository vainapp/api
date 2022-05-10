import faker from '@faker-js/faker'
import { factory } from 'factory-girl'

import User from '../src/app/models/User'

factory.define('User', User, {
  name: faker.name.findName(),
  email: faker.internet.email(),
  verified: false,
  password: faker.internet.password(),
})

export default factory
