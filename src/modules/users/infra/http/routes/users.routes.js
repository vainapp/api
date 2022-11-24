import { Router } from 'express'

import UserController from '../controllers/UserController'
import EmailVerificationLinkController from '../controllers/EmailVerificationLinkController'
import validatorMiddleware from '../../../../../shared/infra/http/middlewares/validator'
import userStoreValidator from '../validators/userStoreValidator'
import PhoneNumberVerificationCodeController from '../controllers/PhoneNumberVerificationCodeController'
import phoneNumberVerificationCodeUpdateValidator from '../validators/phoneNumberVerificationCodeUpdateValidator'

const usersRouter = Router()

usersRouter.post(
  '/',
  validatorMiddleware(userStoreValidator),
  UserController.store
)

usersRouter.get(
  '/verify-email/:email_verification_link_id',
  EmailVerificationLinkController.update
)

usersRouter.post(
  '/verify-phone-number',
  validatorMiddleware(phoneNumberVerificationCodeUpdateValidator),
  PhoneNumberVerificationCodeController.update
)

export default usersRouter
