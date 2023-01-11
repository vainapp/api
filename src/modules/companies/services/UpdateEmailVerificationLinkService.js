import BadRequestError from '../../../shared/errors/BadRequest'
import NotFoundError from '../../../shared/errors/NotFound'
import generateRandomCode from '../../../shared/helpers/generateRandomCode'
import EmailVerificationLink from '../../../shared/infra/sequelize/models/EmailVerificationLink'
import PhoneNumberVerificationCode from '../../../shared/infra/sequelize/models/PhoneNumberVerificationCode'
import SendSMSJob from '../../../shared/jobs/SendSMS'
import Queue from '../../../shared/lib/Queue'
import Employee from '../infra/sequelize/models/Employee'

class UpdateEmailVerificationLinkService {
  async execute({ id, price_id }) {
    if (!price_id) {
      throw new BadRequestError('Informe o ID da assinatura')
    }

    const existingLink = await EmailVerificationLink.findByPk(id)

    if (!existingLink || !existingLink.employee_id) {
      throw new NotFoundError('Este link é inválido')
    }

    const employee = await Employee.findByPk(existingLink.employee_id)
    const phoneNumberAlreadyVerified = employee.phone_number_verified === true

    if (phoneNumberAlreadyVerified) {
      return {
        employee_id: employee.id,
        needs_sms_verification: false,
      }
    }

    const [
      existingPhoneNumberVerificationCode,
      newPhoneNumberVerificationCode,
    ] = await PhoneNumberVerificationCode.findOrCreate({
      where: {
        employee_id: employee.id,
        verified: false,
      },
      defaults: {
        code: generateRandomCode(),
      },
    })

    await Queue.add(SendSMSJob.key, {
      phone: employee.phone_number,
      message: `Olá ${employee.name}, seu código de confirmação é: ${
        !existingPhoneNumberVerificationCode
          ? newPhoneNumberVerificationCode.code
          : existingPhoneNumberVerificationCode.code
      }`,
    })

    if (existingLink.verified) {
      return {
        employee_id: employee.id,
        needs_sms_verification: true,
      }
    }

    await existingLink.update({
      verified: true,
    })

    await employee.update({ email_verified: true })

    return {
      employee_id: employee.id,
      needs_sms_verification: true,
    }
  }
}

export default new UpdateEmailVerificationLinkService()
