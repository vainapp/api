import NotFoundError from '../../../shared/errors/NotFound'
import Employee from '../../../shared/infra/sequelize/models/Employee'
import PhoneNumberVerificationCode from '../../../shared/infra/sequelize/models/PhoneNumberVerificationCode'

class UpdatePhoneNumberVerificationCodeService {
  async execute({ employee_id, code }) {
    const employee = await Employee.findByPk(employee_id)

    if (!employee) {
      throw new NotFoundError('Código de verificação inválido')
    }

    const existingCode = await PhoneNumberVerificationCode.findOne({
      where: {
        employee_id,
        code,
      },
    })

    if (!existingCode) {
      throw new NotFoundError('Código de verificação inválido')
    }

    if (existingCode.verified) {
      return
    }

    await existingCode.update({
      verified: true,
    })

    await employee.update({
      phone_number_verified: true,
    })
  }
}

export default new UpdatePhoneNumberVerificationCodeService()
