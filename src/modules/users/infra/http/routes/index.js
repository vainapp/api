import { Router } from 'express'

import passwordsRouter from './passwords.routes'
import sessionsRouter from './sessions.routes'
import usersRouter from './users.routes'

const routes = Router()

routes.use('/', usersRouter)
routes.use('/sessions', sessionsRouter)
routes.use('/passwords', passwordsRouter)

export default routes
