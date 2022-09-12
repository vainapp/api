import database from '../../src/shared/infra/sequelize'

export default function truncate() {
  return Promise.all(
    Object.keys(database.relationalConnection.models).map((modelName) =>
      database.relationalConnection.models[modelName].destroy({
        where: {},
      })
    )
  )
}
