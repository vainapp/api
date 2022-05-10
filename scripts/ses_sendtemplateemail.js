// Load the AWS SDK for Node.js
let AWS = require('aws-sdk')
// Set the region
AWS.config.update({ region: 'us-east-1' })

// Create sendTemplatedEmail params
let params = {
  Destination: {
    /* required */
    CcAddresses: [
      /* more CC email addresses */
    ],
    ToAddresses: [
      'jopcmelo@gmail.com',
      /* more To email addresses */
    ],
  },
  Source: 'me@jopcmelo.dev' /* required */,
  Template: 'FORGOT_PASSWORD' /* required */,
  TemplateData:
    '{ "name":"João", "code": "1234", "helpEmailAddress": "oi@jopcmelo.dev" }' /* required */,
  ReplyToAddresses: ['oi@jopcmelo.dev'],
}

// Create the promise and SES service object
let sendPromise = new AWS.SES({ apiVersion: '2010-12-01' })
  .sendTemplatedEmail(params)
  .promise()

// Handle promise's fulfilled/rejected states
sendPromise
  .then((data) => {
    console.log(data)
  })
  .catch((err) => {
    console.error(err, err.stack)
  })
