import StoreSessionService from '../services/StoreSessionService'

class SessionController {
  async store(request, response) {
    const { email, password } = request.body

    const result = await StoreSessionService.execute({ email, password })

    return response.json(result)
  }
}

export default new SessionController()
