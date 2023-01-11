import PreSignupCompanyService from '../../../services/PreSignupCompanyService'
import SignupCompanyService from '../../../services/SignupCompanyService'

class CompanyController {
  async show(request, response) {
    const { email, price_id } = request.body

    const { statusCode, responseBody } = await PreSignupCompanyService.execute({
      email,
      price_id,
    })

    return response.status(statusCode).json(responseBody)
  }

  async store(request, response) {
    const {
      email,
      password,
      password_confirmation,
      company_name,
      phone_number,
      name,
      price_id,
    } = request.body

    const result = await SignupCompanyService.execute({
      email,
      password,
      password_confirmation,
      company_name,
      phone_number,
      name,
      price_id,
    })

    return response.json(result)
  }
}

export default new CompanyController()
