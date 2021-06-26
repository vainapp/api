export default class InternalServerError extends Error {
  constructor(message = 'Houve um erro interno no servidor') {
    super(message)

    this.name = this.constructor.name
    this.message = message
    this.status = 500
  }
}
