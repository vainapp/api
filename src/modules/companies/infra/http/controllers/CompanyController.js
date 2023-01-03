import PreSignupCompanyService from '../../../services/PreSignupCompanyService'

class CompanyController {
  async show(request, response) {
    const { email, price_id } = request.body

    const { statusCode, responseBody } = await PreSignupCompanyService.execute({
      email,
      price_id,
    })

    return response.status(statusCode).json(responseBody)
  }
}

export default new CompanyController()
