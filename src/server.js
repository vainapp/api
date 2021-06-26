import app from './app'

app.listen(3333, () => {
  console.info('Server is running!')
  console.log('Environment:', process.env.NODE_ENV)
})
