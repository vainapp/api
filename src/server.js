import app from './app'

app.listen(process.env.APP_PORT, () => {
  console.info('Server is running!')
  console.log('Environment:', process.env.NODE_ENV)
})
