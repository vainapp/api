import AWS from '../../../../config/aws'

class SendSMSService {
  constructor({ phone, message }) {
    this.phone = phone
    this.message = `Grupo C: ${message}`
    this.client = new AWS.SNS({ apiVersion: '2010-03-31' })
  }

  setAttributes() {
    return this.client
      .setSMSAttributes({
        attributes: {
          MonthlySpendLimit: '10',
          DefaultSMSType: 'Transactional',
        },
      })
      .promise()
  }

  async checkIfPhoneHasOptedOut() {
    const response = await this.client
      .checkIfPhoneNumberIsOptedOut({
        phoneNumber: this.phone,
      })
      .promise()

    return response.isOptedOut
  }

  async execute() {
    const phoneNumberHasOptedOut = await this.checkIfPhoneHasOptedOut()

    if (phoneNumberHasOptedOut) {
      return
    }

    await this.setAttributes()

    const params = {
      Message: this.message,
      PhoneNumber: this.phone,
    }

    await this.client.publish(params).promise()
  }
}

export default SendSMSService
