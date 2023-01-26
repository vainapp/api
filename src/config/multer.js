import crypto from 'node:crypto'
import path from 'node:path'

import multer from 'multer'
import multerS3 from 'multer-s3'

import {
  ALLOWED_MIMES,
  MAX_SIZE_IN_MEGA_BYTES,
} from '../shared/constants/files'
import { UnsupportedMediaTypeError } from '../shared/errors'

import AWS from './aws'

const storageTypes = {
  local: multer.diskStorage({
    destination: (_, file, cb) => {
      cb(null, path.resolve(__dirname, '..', 'shared', 'tmp', 'uploads'))
    },
    filename: (_, file, cb) => {
      crypto.randomBytes(16, (error, hash) => {
        if (error) {
          cb(error)
        }

        file.key = `${hash.toString('hex')}-${file.originalname}`
        cb(null, file.key)
      })
    },
  }),
  s3: multerS3({
    s3: new AWS.S3(),
    bucket: process.env.BUCKET_NAME,
    path: 'uploads',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: (_, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) {
          cb(err)
        }

        const fileName = `${hash.toString('hex')}-${file.originalname}`
        cb(null, fileName)
      })
    },
  }),
}

export default {
  dest: path.resolve(__dirname, '..', '..', 'tmp', 'uploads'),
  storage: storageTypes[process.env.STORAGE_TYPE],
  limits: {
    fileSize: MAX_SIZE_IN_MEGA_BYTES,
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new UnsupportedMediaTypeError())
    }
  },
}
