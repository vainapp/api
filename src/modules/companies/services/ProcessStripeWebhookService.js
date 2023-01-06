import stripe from '../../../shared/lib/Stripe'
import Company from '../infra/sequelize/models/Company'

class ProcessStripeWebhookService {
  async execute(payload) {
    const { type } = payload

    if (type === 'checkout.session.completed') {
      await this.handleCheckoutSessionCompleted(payload)
    }
  }

  async handleCheckoutSessionCompleted(payload) {
    const { data } = payload
    const { object } = data
    const {
      client_reference_id,
      customer_email,
      id: checkout_session_id,
      customer: customer_id,
    } = object

    console.log({ customer_email }) // TODO: send email to customer

    const checkout = await stripe.checkout.sessions.retrieve(
      checkout_session_id,
      {
        expand: ['line_items'],
      }
    )

    const company = await Company.findByPk(client_reference_id)

    if (!company.customer_id) {
      company.customer_id = customer_id
    }

    company.price_id = checkout.line_items.data[0].price.id
    company.product_id = checkout.line_items.data[0].price.product

    await company.save()
  }
}

export default new ProcessStripeWebhookService()
