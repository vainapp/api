import { ForbiddenError } from '../../../shared/errors'
import NotFoundError from '../../../shared/errors/NotFound'
import PhoneNumberVerificationCode from '../../../shared/infra/sequelize/models/PhoneNumberVerificationCode'
import SendSMSJob from '../../../shared/jobs/SendSMS'
import Queue from '../../../shared/lib/Queue'
import Employee from '../infra/sequelize/models/Employee'

class StorePhoneNumberVerificationCodeService {
  async execute({ email }) {
    const employee = await Employee.findOne({
      where: { email },
    })

    if (!employee) {
      throw new NotFoundError('Endereço de e-mail não encontrado')
    }

    if (employee.phone_number_verified) {
      throw new ForbiddenError('Número de telefone já verificado')
    }

    const phoneNumberVerificationCode =
      await PhoneNumberVerificationCode.findOne({
        where: { employee_id: employee.id, verified: false },
      })

    if (!phoneNumberVerificationCode) {
      throw new NotFoundError(
        'Código de verificação de telefone não encontrado'
      )
    }

    await Queue.add(SendSMSJob.key, {
      phone: employee.phone_number,
      message: `Olá ${employee.name}, seu código de confirmação é: ${phoneNumberVerificationCode.code}`,
    })
  }
}

export default new StorePhoneNumberVerificationCodeService()
