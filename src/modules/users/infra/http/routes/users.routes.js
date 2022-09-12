import { Router } from 'express'

import UserController from '../controllers/UserController'
import AccountVerificationLinkController from '../controllers/AccountVerificationLinkController'
import validatorMiddleware from '../../../../../shared/infra/http/middlewares/validator'
import userStoreValidator from '../validators/userStoreValidator'

const usersRouter = Router()

usersRouter.post(
  '/',
  validatorMiddleware(userStoreValidator),
  UserController.store
)

usersRouter.get(
  '/verify/:account_verification_link_id',
  AccountVerificationLinkController.update
)

export default usersRouter
