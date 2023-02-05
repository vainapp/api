import { Router } from 'express'

import validatorMiddleware from '../../../../../shared/infra/http/middlewares/validator'
import SessionsController from '../controllers/SessionController'
import sessionStoreValidator from '../validators/sessionStoreValidator'
// import sessionUpdateValidator from '../validators/sessionUpdateValidator'

const sessionsRouter = Router()

sessionsRouter.post(
  '/',
  validatorMiddleware(sessionStoreValidator),
  SessionsController.store
)

// sessionsRouter.post(
//   '/refresh',
//   validatorMiddleware(sessionUpdateValidator),
//   SessionsController.update
// )

export default sessionsRouter
