import { handleCustomerDeleted } from './webhooksHandlers/handleCustomerDeleted'
import { handleCustomerSubscriptionDeleted } from './webhooksHandlers/handleCustomerSubscriptionDeleted'
import { handleInvoicePaymentFailed } from './webhooksHandlers/handleInvoicePaymentFailed'
import { handlePaymentIntentSucceeded } from './webhooksHandlers/handlePaymentIntentSucceeded'

class ProcessStripeWebhookService {
  async execute(payload) {
    const { type } = payload

    switch (type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(payload)
        break
      case 'customer.subscription.deleted':
        await handleCustomerSubscriptionDeleted(payload)
        break
      case 'customer.deleted':
        await handleCustomerDeleted(payload)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(payload)
        break
      default:
        break
    }
  }
}

//   async handleCheckoutSessionCompleted(payload) {
//     const { object: checkout_session } = payload.data
//     const {
//       client_reference_id,
//       customer_email,
//       customer: customer_id,
//       payment_status,
//     } = checkout_session

//     if (payment_status !== 'paid') {
//       return
//     }

//     console.log({ customer_email }) // TODO: send email to customer

//     const checkout = await stripe.checkout.sessions.retrieve(
//       checkout_session.id,
//       {
//         expand: ['line_items'],
//       }
//     )

//     const company = await Company.findByPk(client_reference_id)

//     if (!company) {
//       throw new NotFoundError(
//         'Company not found. This happens when Stripe sends a webhook without the client_reference_id'
//       )
//     }

//     if (!company.customer_id) {
//       company.customer_id = customer_id
//     }

//     company.price_id = checkout.line_items.data[0].price.id
//     company.product_id = checkout.line_items.data[0].price.product

//     await company.save()
//   }

//   async handleInvoicePaymentFailed(payload) {
//     const { object: invoice } = payload.data
//     const { period_end } = invoice
//   }
// }

export default new ProcessStripeWebhookService()
