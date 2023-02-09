import Joi from 'joi'

const employeeStoreSchema = Joi.object({
  name: Joi.string().required().label('Nome'),
  email: Joi.string().email().required().label('E-mail'),
  phone_number: Joi.string().required().label('Telefone'),
  roles: Joi.array()
    .items(
      Joi.string()
        .valid('ADMIN', 'MANAGER', 'EMPLOYEE')
        .required()
        .label('Função')
    )
    .required()
    .label('Funções'),
  franchises_ids: Joi.array().items(Joi.string()).required().label('Franquias'),
})

export default employeeStoreSchema
