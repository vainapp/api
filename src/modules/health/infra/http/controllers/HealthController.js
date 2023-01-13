import HealthService from '../../../services/HealthService'

class HealthController {
  async show(_, response) {
    await HealthService.execute()

    return response.sendStatus(200)
  }
}

export default new HealthController()
