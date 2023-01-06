import { Router } from 'express'

import validatorMiddleware from '../../../../../shared/infra/http/middlewares/validator'
import CompanyController from '../controllers/CompanyController'
import EmailVerificationLinkController from '../controllers/EmailVerificationLinkController'
import companyPreSignupSchema from '../validators/companyPreSignupValidator'
import companySignupSchema from '../validators/companySignupValidator'

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

export default companiesRouter
