import { Router } from 'express'

const employeesRouter = Router()

// employeesRouter.post(
//   '/',
//   validatorMiddleware(userStoreValidator),
//   UserController.store
// )

// employeesRouter.get('/me', authenticationMiddleware, UserController.show)

// employeesRouter.get(
//   '/verify-email/:email_verification_link_id',
//   EmailVerificationLinkController.update
// )

// employeesRouter.post(
//   '/verify-email/resend',
//   validatorMiddleware(resendVerificationStepStoreValidator),
//   EmailVerificationLinkController.store
// )

// employeesRouter.post(
//   '/verify-phone-number/resend',
//   validatorMiddleware(resendVerificationStepStoreValidator),
//   PhoneNumberVerificationCodeController.store
// )

// employeesRouter.post(
//   '/verify-phone-number',
//   validatorMiddleware(phoneNumberVerificationCodeUpdateValidator),
//   PhoneNumberVerificationCodeController.update
// )

export default employeesRouter
