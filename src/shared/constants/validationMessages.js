// Here you can find the list of errors
// https://github.com/hapijs/joi/blob/master/API.md#list-of-errors

const messages = {
  'alternatives.all': 'O campo {#label} é inválido',
  'alternatives.any': 'O campo {#label} é inválido',
  'alternatives.match': 'O campo {#label} é inválido',
  'alternatives.one': 'O campo {#label} é inválido',
  'alternatives.types': 'O campo {#label} é inválido',

  'any.custom': 'O campo {#label} é inválido',
  'any.default': 'O campo {#label} é inválido',
  'any.failover': 'O campo {#label} é inválido',
  'any.invalid': 'O campo {#label} é inválido',
  'any.only': 'O campo {#label} é inválido',
  'any.ref': 'O campo {#label} é inválido',
  'any.required': 'O campo {#label} é obrigatório',
  'any.unknown': 'O campo {#label} é inválido',

  'array.base': 'O campo {#label} deve ser uma lista',
  'array.excludes': 'O campo {#label} contém itens não permitidos',
  'array.includesRequiredBoth':
    'O campo {#label} não contém itens obrigatórios',
  'array.includesRequiredKnowns':
    'O campo {#label} não contém itens obrigatórios',
  'array.includesRequiredUnknowns':
    'O campo {#label} não contém itens obrigatórios',
  'array.includes': 'O campo {#label} não contém itens válidos',
  'array.length': 'O campo {#label} deve ter {#limit} itens',
  'array.max': 'O campo {#label} deve ter no máximo {#limit} itens',
  'array.min': 'O campo {#label} deve ter no mínimo {#limit} itens',
  'array.orderedLength': 'O campo {#label} tem mais itens do que o permitido',
  'array.sort': 'O campo {#label} não está ordenado corretamente',
  'array.sort.mismatching':
    'Não foi possível ordenar o campo {#label} pois os itens não são do mesmo tipo',
  'array.sort.unsupported':
    'Não foi possível ordenar o campo {#label} pois o tipo não é suportado',
  'array.sparse': 'O campo {#label} não deve conter valores vazios',
  'array.unique': 'O campo {#label} possui itens duplicados',
  'array.hasKnown': 'O campo {#label} é inválido',

  'boolean.base': 'O campo {#label} deve ser verdadeiro ou falso',

  'date.base': 'O campo {#label} deve ser uma data',
  'date.format': 'O campo {#label} deve ser uma data no formato {#format}',
  'date.greater': 'O campo {#label} deve ser maior que {#limit}',
  'date.less': 'O campo {#label} deve ser menor que {#limit}',
  'date.max': 'O campo {#label} deve ser menor que {#limit}',
  'date.min': 'O campo {#label} deve ser maior que {#limit}',
  'date.strict':
    'O campo {#label} não é uma data válida ou não pode ser convertida',

  'number.base': 'O campo {#label} deve ser um número',
  'number.greater': 'O campo {#label} deve ser maior que {#limit}',
  'number.infinity': 'O campo {#label} não deve ser infinito',
  'number.less': 'O campo {#label} deve ser menor que {#limit}',
  'number.max': 'O campo {#label} deve ser menor que {#limit}',
  'number.min': 'O campo {#label} deve ser maior que {#limit}',
  'number.multiple': 'O campo {#label} deve ser múltiplo de {#multiple}',
  'number.negative': 'O campo {#label} deve ser um número negativo',
  'number.port': 'O campo {#label} deve ser uma porta válida',
  'number.positive': 'O campo {#label} deve ser um número positivo',
  'number.precision':
    'O campo {#label} deve ter no máximo {#limit} casas decimais',
  'number.unsafe': 'O campo {#label} não é um número seguro',

  'object.base': 'O campo {#label} deve ser um objeto',
  'object.unknown': 'O campo {#label} possui chaves não permitidas',
  'object.and': 'O campo {#label} é inválido',
  'object.assert': 'O campo {#label} é inválido',
  'object.length': 'O campo {#label} possui mais chaves do que o permitido',
  'object.max': 'O campo {#label} possui mais chaves do que o permitido',
  'object.min': 'O campo {#label} possui menos chaves do que o permitido',
  'object.missing': 'O campo {#label} é inválido',
  'object.nand': 'O campo {#label} é inválido',
  'object.pattern.match': 'O campo {#label} é inválido',
  'object.refType': 'O campo {#label} é inválido',
  'object.regex': 'O campo {#label} é inválido',
  'object.rename.multiple': 'O campo {#label} já foi renomeado',
  'object.rename.override': 'O campo {#label} não permite sobrescrita',
  'object.schema': 'O campo {#label} é inválido',
  'object.instance': 'O campo {#label} é inválido',
  'object.with': 'O campo {#label} é inválido',
  'object.without': 'O campo {#label} é inválido',
  'object.xor': 'O campo {#label} é inválido',
  'object.oxor': 'O campo {#label} é inválido',

  'string.base': 'O campo {#label} deve ser um texto',
  'string.alphanum':
    'O campo {#label} deve conter apenas caracteres alfanuméricos',
  'string.base64': 'O campo {#label} deve ser uma string base64 válida',
  'string.creditCard': 'O campo {#label} deve ser um cartão de crédito válido',
  'string.dataUri': 'O campo {#label} deve ser uma data URI válida',
  'string.domain': 'O campo {#label} deve ser um domínio válido',
  'string.email': 'O campo {#label} deve ser um e-mail válido',
  'string.empty': 'O campo {#label} não pode ser vazio',
  'string.guid': 'O campo {#label} deve ser um GUID válido',
  'string.hexAlign': 'O campo {#label} deve ser uma string hexadecimal válida',
  'string.hex': 'O campo {#label} deve ser uma string hexadecimal válida',
  'string.hostname': 'O campo {#label} deve ser um hostname válido',
  'string.ipVersion': 'O campo {#label} deve ser um IP válido',
  'string.ip': 'O campo {#label} deve ser um IP válido',
  'string.isoDate': 'O campo {#label} deve ser uma data ISO 8601 válida',
  'string.isoDuration': 'O campo {#label} deve ser uma duração ISO 8601 válida',
  'string.length': 'O campo {#label} deve ter {#limit} caracteres',
  'string.lowercase':
    'O campo {#label} deve conter apenas caracteres minúsculos',
  'string.max': 'O campo {#label} deve ter no máximo {#limit} caracteres',
  'string.min': 'O campo {#label} deve ter no mínimo {#limit} caracteres',
  'string.normalize': 'O campo {#label} deve ser uma string normalizada',
  'string.pattern.base': 'O campo {#label} é inválido',
  'string.pattern.name': 'O campo {#label} é inválido',
  'string.pattern.invert.base': 'O campo {#label} é inválido',
  'string.pattern.invert.name': 'O campo {#label} é inválido',
  'string.token': 'O campo {#label} deve ser uma string de token válida',
  'string.trim': 'O campo {#label} deve ser uma string sem espaços',
  'string.uppercase':
    'O campo {#label} deve conter apenas caracteres maiúsculos',
  'string.uri': 'O campo {#label} deve ser uma URI válida',
  'string.uriCustomScheme': 'O campo {#label} deve ser uma URI válida',
  'string.uriRelativeOnly': 'O campo {#label} deve ser uma URI válida',
}

export default messages
