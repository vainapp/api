import AWS from 'aws-sdk'

AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
})

export default AWS
