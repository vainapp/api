import * as Sentry from '@sentry/node'
import Bee from 'bee-queue'

import redisConfig from '../config/redis'
import sentryConfig from '../config/sentry'

import SendEmail from '../app/jobs/SendEmail'

const jobs = [SendEmail]

class Queue {
  constructor() {
    this.queues = {}

    this.init()
  }

  init() {
    Sentry.init(sentryConfig())

    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      }
    })
  }

  async add(queue, job) {
    await this.queues[queue].bee.createJob(job).save()
  }

  processQueue() {
    jobs.forEach((job) => {
      const { bee, handle } = this.queues[job.key]
      bee.on('failed', this.handleFailure).process(handle)
    })
  }

  handleFailure(job, error) {
    console.error(`Queue ${job.queue.name} FAILED:`, error)
    Sentry.captureException(error)
  }

  closeConnections() {
    Object.keys(this.queues).forEach((queue) => {
      this.queues[queue].bee.close()
    })
  }
}

export default new Queue()
