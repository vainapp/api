// Load the AWS SDK for Node.js
let fs = require('fs')

let AWS = require('aws-sdk')
// Set the region
AWS.config.update({ region: 'us-east-1' })

// Create updateTemplate parameters
let params = {
  Template: {
    TemplateName: 'COMPANY_CUSTOMER_SUBSCRIPTION_TRIAL_WILL_END' /* required */,
    HtmlPart: fs
      .readFileSync(
        'src/modules/companies/views/COMPANY_CUSTOMER_SUBSCRIPTION_TRIAL_WILL_END/COMPANY_CUSTOMER_SUBSCRIPTION_TRIAL_WILL_END.html'
      )
      .toString(),
    SubjectPart: 'Seu período de teste da Vain está acabando!',
    TextPart: fs
      .readFileSync(
        'src/modules/companies/views/COMPANY_CUSTOMER_SUBSCRIPTION_TRIAL_WILL_END/COMPANY_CUSTOMER_SUBSCRIPTION_TRIAL_WILL_END.txt'
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
