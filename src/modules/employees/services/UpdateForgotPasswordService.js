import BadRequestError from '../../../shared/errors/BadRequest'
import NotFoundError from '../../../shared/errors/NotFound'
import Employee from '../../../shared/infra/sequelize/models/Employee'
import ForgotPasswordCode from '../../../shared/infra/sequelize/models/ForgotPasswordCode'

class UpdateForgotPasswordService {
  async execute({ forgot_password_code_id, password, password_confirmation }) {
    const forgotPasswordCode = await ForgotPasswordCode.findOne({
      where: {
        id: forgot_password_code_id,
        active: true,
      },
    })

    if (!forgotPasswordCode) {
      throw new NotFoundError('Código de recuperação de senha inválido')
    }

    if (password !== password_confirmation) {
      throw new BadRequestError('As senhas precisam ser iguais')
    }

    const { employee_id } = forgotPasswordCode

    const employee = await Employee.findOne({
      where: {
        id: employee_id,
      },
    })

    if (!employee || !employee.verified) {
      throw new NotFoundError('Conta não encontrada')
    }

    await forgotPasswordCode.update({ active: false })
    await employee.update({ password })
  }
}

export default new UpdateForgotPasswordService()
