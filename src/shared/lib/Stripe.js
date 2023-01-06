import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2022-08-01',
  appInfo: {
    name: 'back-end',
  },
})

export const generateCheckoutSession = async ({
  price_id,
  company_id,
  employee_email,
}) => {
  const existingPendingCheckoutSessions = await stripe.checkout.sessions.list({
    customer_details: {
      email: employee_email,
    },
  })

  await Promise.all(
    existingPendingCheckoutSessions.data.map(async (session) => {
      if (session.status === 'open') {
        await stripe.checkout.sessions.expire(session.id)
      }
    })
  )

  const result = await stripe.checkout.sessions.create({
    success_url: `${process.env.APP_WEB_URL}/checkout/success`,
    cancel_url: `${process.env.APP_WEB_URL}/checkout/cancel`,
    client_reference_id: company_id,
    customer_email: employee_email,
    mode: 'subscription',
    line_items: [
      {
        price: price_id,
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
  })

  return result
}

export default stripe
