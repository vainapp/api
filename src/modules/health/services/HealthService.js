import CacheService from '../../../shared/services/CacheService'
import User from '../../users/infra/sequelize/models/User'

class HealthService {
  async execute() {
    // test Redis connection
    await CacheService.recover('health-check')

    // test PostgreSQL connection
    await User.findOne()
  }
}

export default new HealthService()
