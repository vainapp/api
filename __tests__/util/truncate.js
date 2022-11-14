import database from '../../src/shared/infra/sequelize'

export default function truncate() {
  return Promise.all(
    Object.keys(database.connection.models).map((modelName) =>
      database.connection.models[modelName].destroy({
        where: {},
      })
    )
  )
}
