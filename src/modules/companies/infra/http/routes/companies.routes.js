import { Router } from 'express'

import validatorMiddleware from '../../../../../shared/infra/http/middlewares/validator'
import CompanyController from '../controllers/CompanyController'
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

export default companiesRouter
