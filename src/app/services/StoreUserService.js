import BadRequestError from '../errors/BadRequest'
import ForbiddenError from '../errors/Forbidden'
import User from '../models/User'

class StoreUserService {
  async execute({ email, name, password, passwordConfirmation }) {
    if (password !== passwordConfirmation) {
      throw new BadRequestError('As senhas precisam ser iguais')
    }

    const emailInUse = await User.findOne({
      where: { email },
    })

    if (emailInUse?.verified) {
      throw new ForbiddenError('Este endereço de e-mail já está cadastrado')
    }

    if (emailInUse) {
      // TODO send email verification using queues

      return {
        id: emailInUse.id,
        email: emailInUse.email,
      }
    }

    const { id } = await User.create({
      email,
      name,
      password,
    })

    // TODO send email verification using queues

    return {
      id,
      email,
    }
  }
}

export default new StoreUserService()
