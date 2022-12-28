// Load the AWS SDK for Node.js
let fs = require('fs')

let AWS = require('aws-sdk')
// Set the region
AWS.config.update({ region: 'us-east-1' })

// Create createTemplate params
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
  .createTemplate(params)
  .promise()

// Handle promise's fulfilled/rejected states
templatePromise
  .then((data) => {
    console.log(data)
  })
  .catch((err) => {
    console.error(err, err.stack)
  })
