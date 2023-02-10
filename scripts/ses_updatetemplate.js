let fs = require('fs')

let AWS = require('aws-sdk')

AWS.config.update({ region: 'us-east-1' })

let params = {
  Template: {
    TemplateName: 'USER_VERIFY_EMAIL',
    HtmlPart: fs
      .readFileSync(
        'src/modules/users/views/USER_VERIFY_EMAIL/USER_VERIFY_EMAIL.html'
      )
      .toString(),
    SubjectPart: 'Verifique seu e-mail',
    TextPart: fs
      .readFileSync(
        'src/modules/users/views/USER_VERIFY_EMAIL/USER_VERIFY_EMAIL.txt'
      )
      .toString(),
  },
}

let templatePromise = new AWS.SES({ apiVersion: '2010-12-01' })
  .updateTemplate(params)
  .promise()

templatePromise
  .then(() => {
    console.log('Template Updated')
  })
  .catch((err) => {
    console.error(err, err.stack)
  })
