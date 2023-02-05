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

export default employeesRouter
