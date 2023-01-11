import { Router } from 'express'

import validatorMiddleware from '../../../../../shared/infra/http/middlewares/validator'
import ForgotPasswordController from '../controllers/ForgotPasswordController'
import forgotPasswordShowValidator from '../validators/forgotPasswordShowValidator'
import forgotPasswordStoreValidator from '../validators/forgotPasswordStoreValidator'
import forgotPasswordUpdateValidator from '../validators/forgotPasswordUpdateValidator'

const passwordsRouter = Router()

passwordsRouter.post(
  '/forgot',
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
