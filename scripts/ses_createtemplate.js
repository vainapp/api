// Load the AWS SDK for Node.js
let AWS = require('aws-sdk')
// Set the region
AWS.config.update({ region: 'us-east-1' })

// Create createTemplate params
let params = {
  Template: {
    TemplateName: 'VERIFY_ACCOUNT' /* required */,
    HtmlPart: '<h1>Olá, {{name}}!</h1>',
    SubjectPart: 'Verifique seu e-mail',
    TextPart: 'Olá, {{name}}!',
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
