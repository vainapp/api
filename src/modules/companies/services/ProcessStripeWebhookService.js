class ProcessStripeWebhookService {
  async execute(payload) {
    console.log('ProcessStripeWebhookService.execute()', payload)
  }
}

export default new ProcessStripeWebhookService()
