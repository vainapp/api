import Joi from 'joi'

const companyStoreSchema = Joi.object({
  name: Joi.string().required().label('Nome pessoal'),
  email: Joi.string().email().required().label('E-mail pessoal'),
  company_name: Joi.string().required().label('Nome da empresa'),
  password: Joi.string().min(6).required().label('Senha'),
  password_confirmation: Joi.string().required().label('Confirmação de senha'),
  phone_number: Joi.string().required().label('Telefone pessoal'),
})

export default companyStoreSchema
