import * as Sentry from '@sentry/node'
import Bee from 'bee-queue'

import redisConfig from '../config/redis'

const jobs = []

class Queue {
  constructor() {
    this.queues = {}

    this.init()
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      }
    })
  }

  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save()
  }

  processQueue() {
    jobs.forEach((job) => {
      const { bee, handle } = this.queues[job.key]

      bee.on('fialed', this.handleFailure).process(handle)
    })
  }

  handleFailure(job, error) {
    console.error(`Queue ${job.queue.name}: FAILED`, error)
    Sentry.captureException(error)
  }
}

export default new Queue()
