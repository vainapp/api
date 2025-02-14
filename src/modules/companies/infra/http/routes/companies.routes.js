import { Router } from 'express'

import validatorMiddleware from '../../../../../shared/infra/http/middlewares/validator'
import CompanyController from '../controllers/CompanyController'
import EmailVerificationLinkController from '../controllers/EmailVerificationLinkController'
import PhoneNumberVerificationCodeController from '../controllers/PhoneNumberVerificationCodeController'
import companyPreSignupSchema from '../validators/companyPreSignupValidator'
import companySignupSchema from '../validators/companySignupValidator'
import phoneNumberVerificationCodeUpdateSchema from '../validators/phoneNumberVerificationCodeUpdateValidator'
import resendEmailVerificationSchema from '../validators/resendEmailVerificationValidator'
import resendPhoneNumberVerificationCodeSchema from '../validators/resendPhoneNumberVerificationCodeValidator'

const companiesRouter = Router()

companiesRouter.post(
  '/',
  validatorMiddleware(companySignupSchema),
  CompanyController.store
)

companiesRouter.post(
  '/pre-signup',
  validatorMiddleware(companyPreSignupSchema),
  CompanyController.show
)

companiesRouter.get(
  '/verify-email/:email_verification_link_id',
  EmailVerificationLinkController.update
)

companiesRouter.post(
  '/verify-phone-number',
  validatorMiddleware(phoneNumberVerificationCodeUpdateSchema),
  PhoneNumberVerificationCodeController.update
)

companiesRouter.post(
  '/verify-email/resend',
  validatorMiddleware(resendEmailVerificationSchema),
  EmailVerificationLinkController.store
)

companiesRouter.post(
  '/verify-phone-number/resend',
  validatorMiddleware(resendPhoneNumberVerificationCodeSchema),
  PhoneNumberVerificationCodeController.store
)

export default companiesRouter
