import CreateCheckoutSessionService from '../../../services/CreateCheckoutSessionService'
import ProcessStripeWebhookService from '../../../services/ProcessStripeWebhookService'

class CheckoutSessionController {
  async store(request, response) {
    const { price_id, employee_id } = request.body

    const result = await CreateCheckoutSessionService.execute({
      price_id,
      employee_id,
    })

    return response.json(result)
  }

  async update(request, response) {
    const payload = request.body

    await ProcessStripeWebhookService.execute(payload)

    return response.sendStatus(200)
  }
}

export default new CheckoutSessionController()
