import os from 'os'
import cluster from 'cluster'

function runPrimaryProcess() {
  const cpuLength = os.cpus().length
  console.info(`Primary ${process.pid} is running`)
  console.info(`Forking server with ${cpuLength} processes\n`)

  for (let index = 0; index < cpuLength; index++) {
    cluster.fork()
  }
}

async function runWorkerProcess() {
  await import('./server')

  cluster.on('exit', (worker, code, signal) => {
    if (code !== 0 && !worker.exitedAfterDisconnect) {
      console.info(
        `Process ${worker.process.pid} died with signal ${signal}. Scheduling another one...`
      )
      cluster.fork()
    }
  })
}

// eslint-disable-next-line no-unused-expressions
cluster.isPrimary ? runPrimaryProcess() : runWorkerProcess()
