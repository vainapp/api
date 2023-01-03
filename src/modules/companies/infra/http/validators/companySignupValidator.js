import Joi from 'joi'

const companySignupSchema = Joi.object({
  email: Joi.string().email().required().label('E-mail pessoal'),
  password: Joi.string().min(6).required().label('Senha'),
  password_confirmation: Joi.string()
    .min(6)
    .required()
    .label('Confirmação de senha'),
  company_name: Joi.string().required().label('Nome da empresa'),
  phone_number: Joi.string().required().label('Telefone'),
  name: Joi.string().required().label('Nome pessoal'),
  price_id: Joi.string().required().label('ID do preço'),
})

export default companySignupSchema
