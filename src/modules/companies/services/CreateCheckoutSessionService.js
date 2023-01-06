import { ForbiddenError, NotFoundError } from '../../../shared/errors'
import { generateCheckoutSession } from '../../../shared/lib/Stripe'
import Company from '../infra/sequelize/models/Company'
import Employee from '../infra/sequelize/models/Employee'
import EmployeeRole from '../infra/sequelize/models/EmployeeRole'

class CreateCheckoutSessionService {
  async execute({ price_id, company_id, employee_email }) {
    const company = await Company.findByPk(company_id)

    if (!company) {
      throw new NotFoundError('Empresa não encontrada')
    }

    const employee = await Employee.findOne({
      where: {
        email: employee_email,
      },
      include: [
        {
          model: EmployeeRole,
          attributes: ['id', 'role'],
        },
      ],
    })

    if (!employee) {
      throw new NotFoundError('Funcionário não encontrado')
    }

    if (!employee.verified) {
      throw new ForbiddenError('Conta não verificada')
    }

    const isAdmin = employee.EmployeeRoles.some((role) => role.role === 'ADMIN')

    if (company.admin_id !== employee.id || isAdmin === false) {
      throw new ForbiddenError('Apenas o administrador pode realizar essa ação')
    }

    const { url: checkout_url } = await generateCheckoutSession({
      price_id,
      company_id,
      employee_email,
    })

    return { checkout_url }
  }
}

export default new CreateCheckoutSessionService()
