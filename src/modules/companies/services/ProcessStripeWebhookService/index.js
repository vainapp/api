import { handleCustomerDeleted } from './webhooksHandlers/handleCustomerDeleted'
import { handleCustomerSubscriptionDeleted } from './webhooksHandlers/handleCustomerSubscriptionDeleted'
import { handleCustomerSubscriptionTrialWillEnd } from './webhooksHandlers/handleCustomerSubscriptionTrialWillEnd'
import { handleInvoicePaymentFailed } from './webhooksHandlers/handleInvoicePaymentFailed'
import { handleInvoicePaymentSucceeded } from './webhooksHandlers/handleInvoicePaymentSucceeded'
import { handlePaymentIntentSucceeded } from './webhooksHandlers/handlePaymentIntentSucceeded'

class ProcessStripeWebhookService {
  async execute(payload) {
    const { type } = payload

    switch (type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(payload)
        break
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(payload)
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
      case 'customer.subscription.trial_will_end':
        await handleCustomerSubscriptionTrialWillEnd(payload)
        break
      default:
        break
    }
  }
}

export default new ProcessStripeWebhookService()
