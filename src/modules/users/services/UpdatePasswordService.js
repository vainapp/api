import { BadRequestError, ForbiddenError } from '../../../shared/errors'
import User from '../infra/sequelize/models/User'

class UpdatePasswordService {
  async execute({
    user_id,
    current_password,
    new_password,
    new_password_confirmation,
  }) {
    const user = await User.findByPk(user_id)

    const passwordMatch = await user.checkPassword(current_password)
    if (!passwordMatch) {
      throw new ForbiddenError('Senha atual incorreta')
    }

    if (new_password !== new_password_confirmation) {
      throw new BadRequestError('As senhas não conferem')
    }

    user.password = new_password
    await user.save()
  }
}

export default new UpdatePasswordService()
