import StoreEmployeeService from '../../../services/StoreEmployeeService'

class EmployeeController {
  async store(request, response) {
    const {
      name,
      email,
      phone_number,
      password,
      password_confirmation,
      roles,
      franchises_ids,
    } = request.body

    const admin_employee_id = request.employee.id

    const result = await StoreEmployeeService.execute({
      name,
      email,
      phone_number,
      password,
      password_confirmation,
      roles,
      franchises_ids,
      admin_employee_id,
    })

    return response.json(result)
  }
}

export default new EmployeeController()
