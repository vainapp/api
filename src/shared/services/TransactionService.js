import sequelize from '../infra/sequelize'

class TransactionService {
  createTransaction() {
    return sequelize.connection.transaction()
  }
}

export default TransactionService
