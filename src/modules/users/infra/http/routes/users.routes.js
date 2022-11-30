import { Router } from 'express'
import multer from 'multer'

import multerConfig from '../../../../../config/multer'
import validatorMiddleware from '../../../../../shared/infra/http/middlewares/validator'
import authenticationMiddleware from '../middlewares/authentication'
import userStoreValidator from '../validators/userStoreValidator'
import resendVerificationStepStoreValidator from '../validators/resendVerificationStepStoreValidator'
import updatePasswordValidator from '../validators/updatePasswordValidator'
import phoneNumberVerificationCodeUpdateValidator from '../validators/phoneNumberVerificationCodeUpdateValidator'
import UpdatePasswordController from '../controllers/UpdatePasswordController'
import UserController from '../controllers/UserController'
import EmailVerificationLinkController from '../controllers/EmailVerificationLinkController'
import PhoneNumberVerificationCodeController from '../controllers/PhoneNumberVerificationCodeController'
import ProfilePhotoController from '../controllers/ProfilePhotoController'

const usersRouter = Router()

usersRouter.post(
  '/',
  validatorMiddleware(userStoreValidator),
  UserController.store
)

usersRouter.get('/me', authenticationMiddleware, UserController.show)

usersRouter.get(
  '/verify-email/:email_verification_link_id',
  EmailVerificationLinkController.update
)

usersRouter.post(
  '/verify-email/resend',
  validatorMiddleware(resendVerificationStepStoreValidator),
  EmailVerificationLinkController.store
)

usersRouter.post(
  '/verify-phone-number',
  validatorMiddleware(phoneNumberVerificationCodeUpdateValidator),
  PhoneNumberVerificationCodeController.update
)

usersRouter.post(
  '/profile-photo',
  authenticationMiddleware,
  multer(multerConfig).single('file'),
  ProfilePhotoController.store
)

usersRouter.delete(
  '/profile-photo/:profile_photo_id',
  authenticationMiddleware,
  ProfilePhotoController.delete
)

usersRouter.put(
  '/change-password',
  validatorMiddleware(updatePasswordValidator),
  authenticationMiddleware,
  UpdatePasswordController.update
)

export default usersRouter
