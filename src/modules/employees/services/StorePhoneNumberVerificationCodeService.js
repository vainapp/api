import { ForbiddenError } from '../../../shared/errors'
import NotFoundError from '../../../shared/errors/NotFound'
import Employee from '../../../shared/infra/sequelize/models/Employee'
import PhoneNumberVerificationCode from '../../../shared/infra/sequelize/models/PhoneNumberVerificationCode'
import SendSMSJob from '../../../shared/jobs/SendSMS'
import Queue from '../../../shared/lib/Queue'

class StorePhoneNumberVerificationCodeService {
  async execute({ employee_id }) {
    const employee = await Employee.findByPk(employee_id)

    if (!employee) {
      throw new NotFoundError('Conta não encontrada')
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
