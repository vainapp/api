import { Router } from 'express'

import companiesRouter from './companies.routes'
import paymentsRouter from './payments.routes'

const routes = Router()

routes.use('/', companiesRouter)
routes.use('/payments', paymentsRouter)

export default routes
