export default class NotFoundError extends Error {
  constructor(message = 'Não encontrado') {
    super(message)

    this.name = this.constructor.name
    this.message = message
    this.status = 404
  }
}
