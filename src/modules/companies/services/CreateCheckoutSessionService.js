import { ForbiddenError, NotFoundError } from '../../../shared/errors'
import { generateCheckoutSession } from '../../../shared/lib/Stripe'
import Company from '../infra/sequelize/models/Company'
import Employee from '../infra/sequelize/models/Employee'
import EmployeeRole from '../infra/sequelize/models/EmployeeRole'

class CreateCheckoutSessionService {
  async execute({ price_id, employee_id }) {
    const employee = await Employee.findByPk(employee_id, {
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

    if (isAdmin === false) {
      throw new ForbiddenError('Apenas o administrador pode realizar essa ação')
    }

    const company = await Company.findOne({
      where: {
        admin_id: employee.id,
      },
    })

    if (!company) {
      throw new NotFoundError('Empresa não encontrada')
    }

    const { url: checkout_url } = await generateCheckoutSession({
      price_id,
      company_id: company.id,
      customer_id: company.customer_id,
    })

    return { checkout_url }
  }
}

export default new CreateCheckoutSessionService()
