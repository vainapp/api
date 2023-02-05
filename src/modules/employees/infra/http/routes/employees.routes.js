import { Router } from 'express'

import validatorMiddleware from '../../../../../shared/infra/http/middlewares/validator'
import EmailVerificationLinkController from '../controllers/EmailVerificationLinkController'
import EmployeeController from '../controllers/EmployeeController'
import PhoneNumberVerificationCodeController from '../controllers/PhoneNumberVerificationCodeController'
import employeeStoreSchema from '../validators/employeeStoreValidator'
import phoneNumberVerificationCodeUpdateSchema from '../validators/phoneNumberVerificationCodeUpdateValidator'
import resendEmailVerificationSchema from '../validators/resendEmailVerificationValidator'
import resendPhoneNumberVerificationCodeSchema from '../validators/resendPhoneNumberVerificationCodeValidator'

const employeesRouter = Router()

employeesRouter.post(
  '/',
  validatorMiddleware(employeeStoreSchema),
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

employeesRouter.post(
  '/verify-phone-number',
  validatorMiddleware(phoneNumberVerificationCodeUpdateSchema),
  PhoneNumberVerificationCodeController.update
)

employeesRouter.post(
  '/verify-phone-number/resend',
  validatorMiddleware(resendPhoneNumberVerificationCodeSchema),
  PhoneNumberVerificationCodeController.store
)

export default employeesRouter
