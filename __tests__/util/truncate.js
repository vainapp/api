import database from '../../src/database'

export default function truncate() {
  return Promise.all(
    Object.keys(database.relationalConnection.models).map((modelName) =>
      database.relationalConnection.models[modelName].destroy({
        where: {},
      })
    )
  )
}
