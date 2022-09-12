export default class ForbiddenError extends Error {
  constructor(message = 'Operação proibida') {
    super(message)

    this.name = this.constructor.name
    this.message = message
    this.status = 403
  }
}
