import { Router } from 'express'

import {
  AccountVerificationLinkController,
  UserController,
  SessionController,
  ForgotPasswordController,
} from './app/controllers'
import { validatorMiddleware } from './app/middlewares'

const routes = new Router()

routes.post('/users', validatorMiddleware('userStore'), UserController.store)
routes.get(
  '/verify/:account_verification_link_id',
  AccountVerificationLinkController.update
)
routes.post(
  '/sessions',
  validatorMiddleware('sessionStore'),
  SessionController.store
)
routes.post(
  '/forgot-password',
  validatorMiddleware('forgotPasswordStore'),
  ForgotPasswordController.store
)
routes.post(
  '/forgot-password/verify',
  validatorMiddleware('forgotPasswordShow'),
  ForgotPasswordController.show
)
routes.post(
  '/forgot-password/reset-password',
  validatorMiddleware('forgotPasswordUpdate'),
  ForgotPasswordController.update
)

export default routes
