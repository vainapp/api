import { Router } from 'express'

import employeesRouter from './employees.routes'
import passwordsRouter from './passwords.routes'
import sessionsRouter from './sessions.routes'

const routes = Router()

routes.use('/', employeesRouter)
routes.use('/sessions', sessionsRouter)
routes.use('/passwords', passwordsRouter)

export default routes
