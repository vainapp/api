import { ForbiddenError } from '../../../shared/errors'
import User from '../infra/sequelize/models/User'

class UpdatePasswordService {
  async execute({
    userId,
    currentPassword,
    newPassword,
    newPasswordConfirmation,
  }) {
    const user = await User.findByPk(userId)

    const passwordMatch = await user.checkPassword(currentPassword)
    if (!passwordMatch) {
      throw new ForbiddenError('Senha atual incorreta')
    }

    if (newPassword !== newPasswordConfirmation) {
      throw new ForbiddenError('As senhas não conferem')
    }

    user.password = newPassword
    await user.save()
  }
}

export default new UpdatePasswordService()
