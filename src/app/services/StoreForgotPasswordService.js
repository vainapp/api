import ForgotPasswordCode from '../models/ForgotPasswordCode'
import User from '../models/User'
import NotFoundError from '../errors/NotFound'
import Queue from '../../lib/Queue'
// import RecoveryCodeJob from '../jobs/VerificationCodeSMS'

class StoreForgotPasswordService {
  async execute({ email }) {
    const user = await User.findOne({
      where: {
        email,
        verified: true,
      },
    })

    if (!user) {
      throw new NotFoundError(
        'Este endereço de e-mail não está vinculado à uma conta verificada'
      )
    }

    const forgotPasswordCode = await ForgotPasswordCode.findOne({
      where: {
        user_id: user.id,
        active: true,
      },
    })

    if (forgotPasswordCode) {
      await forgotPasswordCode.update({ active: false })
    }

    const { code } = await ForgotPasswordCode.create({
      user_id: user.id,
    })

    // await Queue.add(RecoveryCodeJob.key, {
    //   message: {
    //     email,
    //     message: `Este é o seu código para recuperar sua senha: ${code}`,
    //   },
    // })
  }
}

export default new StoreForgotPasswordService()
