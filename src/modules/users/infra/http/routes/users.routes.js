import { Router } from 'express'
import multer from 'multer'
import multerConfig from '../../../../../config/multer'

import UserController from '../controllers/UserController'
import EmailVerificationLinkController from '../controllers/EmailVerificationLinkController'
import PhoneNumberVerificationCodeController from '../controllers/PhoneNumberVerificationCodeController'
import ProfilePhotoController from '../controllers/ProfilePhotoController'
import validatorMiddleware from '../../../../../shared/infra/http/middlewares/validator'
import authenticationMiddleware from '../middlewares/authentication'
import userStoreValidator from '../validators/userStoreValidator'
import phoneNumberVerificationCodeUpdateValidator from '../validators/phoneNumberVerificationCodeUpdateValidator'

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

export default usersRouter
