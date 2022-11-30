import Joi from 'joi'

const userStoreSchema = Joi.object({
  name: Joi.string().required().label('Nome'),
  email: Joi.string().email().required().label('E-mail'),
  password: Joi.string().min(6).required().label('Senha'),
  password_confirmation: Joi.string()
    .required()
    .valid(Joi.ref('password'))
    .label('Confirmação de senha'),
  address: Joi.object({
    street: Joi.string().required().label('Rua'),
    number: Joi.string().required().label('Número'),
    complement: Joi.string().label('Complemento'),
    district: Joi.string().required().label('Bairro'),
    city: Joi.string().required().label('Cidade'),
    state: Joi.string().required().label('Estado'),
    zip_code: Joi.string().required().label('CEP'),
    country: Joi.string().required().label('País'),
  })
    .required()
    .label('Endereço'),
  genre: Joi.string()
    .valid('female', 'male', 'other')
    .required()
    .label('Gênero'),
  phone_number: Joi.string().required().label('Telefone'),
})

export default userStoreSchema
