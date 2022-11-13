import sequelize from '../infra/sequelize'

class TransactionService {
  constructor() {
    this.createTransaction()
  }

  async createTransaction() {
    this.transaction = await sequelize.relationalConnection.transaction()
  }
}

export default TransactionService
