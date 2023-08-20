import NotFoundError from '../../../shared/errors/NotFound'
import buildDirectEmailParams from '../../../shared/helpers/buildDirectEmailParams'
import Employee from '../../../shared/infra/sequelize/models/Employee'
import ForgotPasswordCode from '../../../shared/infra/sequelize/models/ForgotPasswordCode'
import SendEmailJob from '../../../shared/jobs/SendEmail'
import Queue from '../../../shared/lib/Queue'

class StoreForgotPasswordService {
  async execute({ email }) {
    const employee = await Employee.findOne({
      where: {
        email,
      },
    })

    if (!employee || !employee.verified) {
      throw new NotFoundError(
        'Este endereço de e-mail não está vinculado à uma conta verificada'
      )
    }

    const forgotPasswordCode = await ForgotPasswordCode.findOne({
      where: {
        employee_id: employee.id,
        active: true,
      },
    })

    if (forgotPasswordCode) {
      await forgotPasswordCode.update({ active: false })
    }

    const { code } = await ForgotPasswordCode.create({
      employee_id: employee.id,
    })

    const forgotPasswordParams = await buildDirectEmailParams({
      toAddress: employee.email,
      template: 'USER_FORGOT_PASSWORD',
      templateData: {
        name: employee.name,
        code,
      },
    })

    await Queue.add(SendEmailJob.key, forgotPasswordParams)
  }
}

export default new StoreForgotPasswordService()
