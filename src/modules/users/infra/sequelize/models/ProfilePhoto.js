import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

import * as Sentry from '@sentry/node'
import Sequelize, { Model } from 'sequelize'

import AWS from '../../../../../config/aws'

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
        profilePhoto.url = `${process.env.API_URL}/files/${profilePhoto.key}`
      }
    })

    this.addHook('beforeDestroy', async (profilePhoto) => {
      if (process.env.STORAGE_TYPE === 's3') {
        // TODO: add a queue job to delete a file from AWS S3 in background
        return new AWS.S3()
          .deleteObject({
            Bucket: process.env.BUCKET_NAME,
            Key: profilePhoto.key,
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
