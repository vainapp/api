import { Router } from 'express'

import validatorMiddleware from '../../../../../shared/infra/http/middlewares/validator'
import EmployeeController from '../controllers/EmployeeController'
import employeeStoreValidator from '../validators/employeeStoreValidator'

const employeesRouter = Router()

employeesRouter.post(
  '/',
  validatorMiddleware(employeeStoreValidator),
  EmployeeController.store
)

// employeesRouter.get('/me', authenticationMiddleware, UserController.show)

// employeesRouter.get(
//   '/verify-email/:email_verification_link_id',
//   EmailVerificationLinkController.update
// )

// employeesRouter.post(
//   '/verify-email/resend',
//   validatorMiddleware(resendVerificationStepStoreValidator),
//   EmailVerificationLinkController.store
// )

// employeesRouter.post(
//   '/verify-phone-number/resend',
//   validatorMiddleware(resendVerificationStepStoreValidator),
//   PhoneNumberVerificationCodeController.store
// )

// employeesRouter.post(
//   '/verify-phone-number',
//   validatorMiddleware(phoneNumberVerificationCodeUpdateValidator),
//   PhoneNumberVerificationCodeController.update
// )

export default employeesRouter
