// Load the AWS SDK for Node.js
let AWS = require('aws-sdk')
let fs = require('fs')
// Set the region
AWS.config.update({ region: 'us-east-1' })

// Create updateTemplate parameters
let params = {
  Template: {
    TemplateName: 'FORGOT_PASSWORD' /* required */,
    HtmlPart: fs
      .readFileSync('src/app/views/FORGOT_PASSWORD/FORGOT_PASSWORD.html')
      .toString(),
    SubjectPart: 'Recuperação de senha',
    TextPart: fs
      .readFileSync('src/app/views/FORGOT_PASSWORD/FORGOT_PASSWORD.txt')
      .toString(),
  },
}

// Create the promise and SES service object
let templatePromise = new AWS.SES({ apiVersion: '2010-12-01' })
  .updateTemplate(params)
  .promise()

// Handle promise's fulfilled/rejected states
templatePromise
  .then(() => {
    console.log('Template Updated')
  })
  .catch((err) => {
    console.error(err, err.stack)
  })
