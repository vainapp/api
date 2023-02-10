let AWS = require('aws-sdk')

const buildDirectEmailParams = require('../src/shared/helpers/buildDirectEmailParams')

AWS.config.update({ region: 'us-east-1' })

buildDirectEmailParams({
  toAddress: 'jopcmelo@gmail.com',
  template: 'USER_VERIFY_EMAIL',
  templateData: {
    name: 'João',
    action_url: 'https://dev.vainapp.com.br',
    close_account_url: 'https://dev.vainapp.com.br',
    feedback_url: 'https://dev.vainapp.com.br',
    description: '1x de R$60,00 por mês',
    billing_url: 'https://dev.vainapp.com.br',
    payment_intent_id: 'pi_1H8QZoJZ2Z2Z2Z2Z2Z2Z2Z2Z',
    date: '10 de outubro de 2020 às 15:00',
    subscription_active_until: '10 de outubro de 2020 às 15:00',
    invitee_sender_name: 'João',
    invite_sender_organization_name: 'Vain Cortes',
    login_url: 'https://dev.vainapp.com.br',
    email: 'jopcmelo@gmail.com',
    password: '27d1S3cR3t',
    code: '7238',
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
