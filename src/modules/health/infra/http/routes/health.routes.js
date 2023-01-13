import { Router } from 'express'

import HealthController from '../controllers/HealthController'

const healthRouter = Router()

healthRouter.get('/', HealthController.show)

export default healthRouter
