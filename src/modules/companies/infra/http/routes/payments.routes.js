import { Router } from 'express'

import validatorMiddleware from '../../../../../shared/infra/http/middlewares/validator'
import CheckoutSessionController from '../controllers/CheckoutSessionController'
import stripeAuthenticationMiddleware from '../middlewares/stripeAuthentication'
import createCheckoutSessionSchema from '../validators/createCheckoutSessionValidator'

const paymentsRouter = Router()

paymentsRouter.post(
  '/checkout-session',
  validatorMiddleware(createCheckoutSessionSchema),
  CheckoutSessionController.store
)

paymentsRouter.post(
  '/stripe-webhook',
  stripeAuthenticationMiddleware,
  CheckoutSessionController.update
)

export default paymentsRouter
