let AWS = require('aws-sdk')

const buildDirectEmailParams = require('../src/shared/helpers/buildDirectEmailParams')

AWS.config.update({ region: 'us-east-1' })

buildDirectEmailParams({
  toAddress: 'jopcmelo@gmail.com',
  template: 'COMPANY_CUSTOMER_SUBSCRIPTION_TRIAL_WILL_END',
  templateData: {
    name: 'João',
    action_url: 'https://dev.vainapp.com.br',
    close_account_url: 'https://dev.vainapp.com.br',
    feedback_url: 'https://dev.vainapp.com.br',
  },
}).then((params) => {
  let sendPromise = new AWS.SES({ apiVersion: '2010-12-01' })
    .sendTemplatedEmail({
      Destination: {
        CcAddresses: params.ccAddresses,
        ToAddresses: params.toAddresses,
      },
      Source: params.sourceAddress,
      Template: params.template,
      TemplateData: JSON.stringify(params.templateData),
      ReplyToAddresses: params.replyToAddresses,
    })
    .promise()

  sendPromise
    .then((data) => {
      console.log(data)
    })
    .catch((err) => {
      console.error(err, err.stack)
    })
})
