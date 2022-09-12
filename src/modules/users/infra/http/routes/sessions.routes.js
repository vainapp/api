import { Router } from 'express'

import SessionsController from '../controllers/SessionController'
import validatorMiddleware from '../../../../../shared/infra/http/middlewares/validator'
import sessionStoreValidator from '../validators/sessionStoreValidator'

const sessionsRouter = Router()

sessionsRouter.post(
  '/',
  validatorMiddleware(sessionStoreValidator),
  SessionsController.store
)

export default sessionsRouter
