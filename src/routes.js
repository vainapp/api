import { Router } from 'express'

import SessionController from './app/controllers/SessionController'
// import authenticationMiddleware from './app/middlewares/authentication'

const routes = new Router()

routes.post('/sessions', SessionController.store)

export default routes
