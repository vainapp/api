import './bootstrap'

import * as Sentry from '@sentry/node'
import express from 'express'
import 'express-async-errors'
import Youch from 'youch'
import { pick } from 'lodash'

import routes from './routes'
import sentryConfig from '../../../config/sentry'
import isProduction from '../../helpers/isProduction'
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
    this.server.use(express.json())
    this.server.use(express.urlencoded({ extended: true }))
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
