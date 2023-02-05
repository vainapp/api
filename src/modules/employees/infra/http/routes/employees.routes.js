import { Router } from 'express'

import validatorMiddleware from '../../../../../shared/infra/http/middlewares/validator'
import EmailVerificationLinkController from '../controllers/EmailVerificationLinkController'
import EmployeeController from '../controllers/EmployeeController'
import employeeStoreValidator from '../validators/employeeStoreValidator'
import resendEmailVerificationSchema from '../validators/resendEmailVerificationValidator'

const employeesRouter = Router()

employeesRouter.post(
  '/',
  validatorMiddleware(employeeStoreValidator),
  EmployeeController.store
)

employeesRouter.get(
  '/verify-email/:email_verification_link_id',
  EmailVerificationLinkController.update
)

employeesRouter.post(
  '/verify-email/resend',
  validatorMiddleware(resendEmailVerificationSchema),
  EmailVerificationLinkController.store
)

export default employeesRouter
