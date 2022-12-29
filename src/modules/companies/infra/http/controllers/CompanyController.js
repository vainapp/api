import StoreCompanyService from '../../../services/StoreCompanyService'

class CompanyController {
  async store(request, response) {
    const {
      email,
      phone_number,
      name,
      password,
      password_confirmation,
      address,
      genre,
    } = request.body

    const result = await StoreCompanyService.execute({
      email,
      phone_number,
      name,
      password,
      password_confirmation,
      address,
      genre,
    })

    return response.json(result)
  }
}

export default new CompanyController()
