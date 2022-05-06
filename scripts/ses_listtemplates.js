// Load the AWS SDK for Node.js
let AWS = require('aws-sdk')
// Set the region
AWS.config.update({ region: 'us-east-1' })

// Create the promise and SES service object
let templatePromise = new AWS.SES({ apiVersion: '2010-12-01' })
  .listTemplates({ MaxItems: 10 })
  .promise()

// Handle promise's fulfilled/rejected states
templatePromise
  .then((data) => {
    console.log(data)
  })
  .catch((err) => {
    console.error(err, err.stack)
  })
