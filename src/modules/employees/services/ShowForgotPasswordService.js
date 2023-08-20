import NotFoundError from '../../../shared/errors/NotFound'
import Employee from '../../../shared/infra/sequelize/models/Employee'
import ForgotPasswordCode from '../../../shared/infra/sequelize/models/ForgotPasswordCode'

class ShowForgotPasswordService {
  async execute({ email, code }) {
    const employee = await Employee.findOne({
      where: {
        email,
      },
    })

    if (!employee || !employee.verified) {
      throw new NotFoundError('Código de recuperação de senha inválido')
    }

    const forgotPasswordCode = await ForgotPasswordCode.findOne({
      where: {
        employee_id: employee.id,
        code,
        active: true,
      },
    })

    if (!forgotPasswordCode) {
      throw new NotFoundError('Código de recuperação de senha inválido')
    }

    return {
      token: forgotPasswordCode.id,
    }
  }
}

export default new ShowForgotPasswordService()
