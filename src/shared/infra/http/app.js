import './bootstrap'

import * as Sentry from '@sentry/node'
import cors from 'cors'
import express from 'express'
import 'express-async-errors'
import { pick } from 'lodash'
import morgan from 'morgan'
import Youch from 'youch'

import sentryConfig from '../../../config/sentry'
import isProduction from '../../helpers/isProduction'

import maybeMiddleware from './middlewares/maybe'
import routes from './routes'
import '../sequelize'

class App {
  constructor() {
    this.server = express()

    Sentry.init(sentryConfig(this.server))

    this.middlewares()
    this.routes()
    this.exceptionHandler()
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler())
    this.server.use(Sentry.Handlers.tracingHandler())
    this.server.use(cors())
    this.server.use(maybeMiddleware(express.json()))
    this.server.use(express.urlencoded({ extended: true }))
    this.server.use(morgan('dev'))
  }

  routes() {
    this.server.use(routes)
    this.server.use(Sentry.Handlers.errorHandler())
  }

  exceptionHandler() {
    this.server.use(async (error, request, response, next) => {
      const errors = await new Youch(error, request).toJSON()

      Sentry.captureException(error)

      return response
        .status(error.status || 500)
        .json(
          isProduction()
            ? pick(errors, ['error.message', 'error.name', 'error.status'])
            : errors
        )
    })
  }
}

export default new App().server
