import { Router } from 'express'

import ForgotPasswordController from '../controllers/ForgotPasswordController'
import validatorMiddleware from '../../../../../shared/infra/http/middlewares/validator'
import forgotPasswordShowValidator from '../validators/forgotPasswordShowValidator'
import forgotPasswordUpdateValidator from '../validators/forgotPasswordUpdateValidator'
import forgotPasswordStoreValidator from '../validators/forgotPasswordStoreValidator'

const passwordsRouter = Router()

passwordsRouter.post(
  '/',
  validatorMiddleware(forgotPasswordStoreValidator),
  ForgotPasswordController.store
)

passwordsRouter.post(
  '/verify',
  validatorMiddleware(forgotPasswordShowValidator),
  ForgotPasswordController.show
)

passwordsRouter.post(
  '/reset',
  validatorMiddleware(forgotPasswordUpdateValidator),
  ForgotPasswordController.update
)

export default passwordsRouter
