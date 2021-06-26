import Sequelize from 'sequelize'
import mongoose from 'mongoose'

import databaseConfig from '../config/database'
import User from '../app/models/User'

const models = [User]

class Database {
  constructor() {
    this.initRelationalDatabase()
    this.initNonRelationalDatabase()
  }

  initRelationalDatabase() {
    this.relationalConnection = new Sequelize(databaseConfig)

    models
      .map((model) => model.init(this.relationalConnection))
      .map(
        (model) => model.associate && model.associate(this.relationalConnection)
      )
  }

  initNonRelationalDatabase() {
    this.nonRelationalConnection = mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  }
}

export default new Database()
