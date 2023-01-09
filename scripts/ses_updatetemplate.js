// Load the AWS SDK for Node.js
let fs = require('fs')

let AWS = require('aws-sdk')
// Set the region
AWS.config.update({ region: 'us-east-1' })

// Create updateTemplate parameters
let params = {
  Template: {
    TemplateName: 'COMPANY_PAYMENT_INTENT_SUCCEEDED' /* required */,
    HtmlPart: fs
      .readFileSync(
        'src/modules/companies/views/COMPANY_PAYMENT_INTENT_SUCCEEDED/COMPANY_PAYMENT_INTENT_SUCCEEDED.html'
      )
      .toString(),
    SubjectPart: 'Recuperação de senha',
    TextPart: fs
      .readFileSync(
        'src/modules/companies/views/COMPANY_PAYMENT_INTENT_SUCCEEDED/COMPANY_PAYMENT_INTENT_SUCCEEDED.txt'
      )
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
