import database from '../../src/database'
import Queue from '../../src/lib/Queue'

export default async function truncate() {
  Queue.closeConnections()

  await Promise.all(
    Object.keys(database.relationalConnection.models).map((modelName) =>
      database.relationalConnection.models[modelName].destroy({
        where: {},
      })
    )
  )
}
