export default class BadRequestError extends Error {
  constructor(message = 'Requisição malformada') {
    super(message)

    this.name = this.constructor.name
    this.message = message
    this.status = 400
  }
}
