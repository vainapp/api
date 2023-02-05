import StoreSessionService from '../../../services/StoreSessionService'
// import UpdateSessionService from '../../../services/UpdateSessionService'

class SessionController {
  async store(request, response) {
    const { email, password } = request.body

    const result = await StoreSessionService.execute({ email, password })

    return response.json(result)
  }

  // async update(request, response) {
  //   const { refresh_token } = request.body

  //   const result = await UpdateSessionService.execute({
  //     refresh_token,
  //   })

  //   return response.json(result)
  // }
}

export default new SessionController()
