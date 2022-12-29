import { Router } from 'express'

import validatorMiddleware from '../../../../../shared/infra/http/middlewares/validator'
import CompanyController from '../controllers/CompanyController'
import companyStoreSchema from '../validators/companyStoreValidator'

const companiesRouter = Router()

// TODO: Create the /check route, too

companiesRouter.post(
  '/',
  validatorMiddleware(companyStoreSchema),
  CompanyController.store
)

export default companiesRouter
