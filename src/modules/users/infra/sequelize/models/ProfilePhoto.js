import path from 'node:path'
import fs from 'node:fs'
import { promisify } from 'node:util'
import Sequelize, { Model } from 'sequelize'
import * as Sentry from '@sentry/node'

import AWS from '../../../../../config/aws'
import isProduction from '../../../../../shared/helpers/isProduction'

class ProfilePhoto extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true,
          unique: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        size: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        key: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        url: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      },
      { sequelize }
    )

    this.addHook('beforeSave', async (profilePhoto) => {
      if (!profilePhoto.url) {
        profilePhoto.url = `${process.env.APP_HOST}${
          !isProduction() ? `:${process.env.APP_PORT}` : ''
        }/files/${profilePhoto.key}`
      }
    })

    this.addHook('beforeDestroy', async (profilePhoto) => {
      if (process.env.STORAGE_TYPE === 's3') {
        return new AWS.S3()
          .deleteObject({
            Bucket: process.env.BUCKET_NAME,
            Key: this.key,
          })
          .promise()
          .catch((response) => {
            Sentry.captureException(response)
          })
      }
      return promisify(fs.unlink)(
        path.resolve(
          __dirname,
          '..',
          '..',
          '..',
          '..',
          '..',
          'shared',
          'tmp',
          'uploads',
          profilePhoto.key
        )
      )
    })

    return this
  }
}

export default ProfilePhoto
