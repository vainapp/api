import path from 'node:path'

import express, { Router } from 'express'

import passwordsRouter from '../../../../modules/users/infra/http/routes/passwords.routes'
import sessionsRouter from '../../../../modules/users/infra/http/routes/sessions.routes'
import usersRouter from '../../../../modules/users/infra/http/routes/users.routes'

const routes = Router()
routes.use('/users', usersRouter)
routes.use('/sessions', sessionsRouter)
routes.use('/forgot-password', passwordsRouter)
routes.use(
  '/files',
  express.static(path.resolve(__dirname, '..', '..', '..', 'tmp', 'uploads'))
)

export default routes
