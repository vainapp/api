import CreateCheckoutSessionService from '../../../services/CreateCheckoutSessionService'

class CheckoutSessionController {
  async store(request, response) {
    const { price_id, company_id, employee_email } = request.body

    const result = await CreateCheckoutSessionService.execute({
      price_id,
      company_id,
      employee_email,
    })

    return response.json(result)
  }
}

export default new CheckoutSessionController()
