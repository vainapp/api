export default class BadRequestError extends Error {
  constructor(message = 'Tipo de mídia não suportado') {
    super(message)

    this.name = this.constructor.name
    this.message = message
    this.status = 415
  }
}
