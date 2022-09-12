import app from './app'

const { pid, env } = process

const server = app.listen(env.APP_PORT, () => {
  console.info(
    `Server running in process ${pid} | environment: ${env.NODE_ENV}`
  )
})

process.on('SIGTERM', () => {
  console.info('Server ending at', new Date().toISOString())
  server.close(() => process.exit())
})
