import { Router } from 'express'

import AccountVerificationLinkController from './app/controllers/AccountVerificationLinkController'
import UserController from './app/controllers/UserController'
import SessionController from './app/controllers/SessionController'
import ForgotPasswordController from './app/controllers/ForgotPasswordController'

const routes = new Router()

routes.post('/users', UserController.store)
routes.get(
  '/verify/:account_verification_link_id',
  AccountVerificationLinkController.update
)
routes.post('/sessions', SessionController.store)
routes.post('/forgot-password', ForgotPasswordController.store)

export default routes
