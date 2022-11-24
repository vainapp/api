class FakeProvider {
  constructor({ phone, message }) {
    this.phone = phone
    this.message = `Grupo C: ${message}`
  }

  async execute() {
    console.log('SMS sent:', {
      phone: this.phone,
      message: this.message,
    })
  }
}

export default FakeProvider
