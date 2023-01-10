import path from 'node:path'

import express, { Router } from 'express'

import companiesRouter from '../../../../modules/companies/infra/http/routes'
import usersRouter from '../../../../modules/users/infra/http/routes'

const routes = Router()
routes.use('/users', usersRouter)
routes.use('/companies', companiesRouter)
routes.use(
  '/files',
  express.static(path.resolve(__dirname, '..', '..', '..', 'tmp', 'uploads'))
)

export default routes
