import ForbiddenError from '../../../../../shared/errors/Forbidden'
import stripe from '../../../../../shared/lib/Stripe'

export default (request, _, nextCallback) => {
  let data = ''

  request.setEncoding('utf8')

  request.on('data', (chunk) => {
    data += chunk
  })

  request.on('end', () => {
    request.body = data
    const payload = request.body
    const sig = request.headers['stripe-signature']

    try {
      request.body = stripe.webhooks.constructEvent(
        payload,
        sig,
        process.env.STRIPE_SECRET
      )

      return nextCallback()
    } catch (err) {
      throw new ForbiddenError('Não autorizado')
    }
  })
}
