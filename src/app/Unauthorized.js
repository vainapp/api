export default class UnauthorizedError extends Error {
  constructor(message = 'Operação não autorizada') {
    super(message)

    this.name = this.constructor.name
    this.message = message
    this.status = 401
  }
}
