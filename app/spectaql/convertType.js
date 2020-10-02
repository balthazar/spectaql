const { GraphQLScalarType, GraphQLNonNull, GraphQLList } = require('graphql')

const SCALARS = {
  Int: 'integer',
  Float: 'number',
  String: 'string',
  Boolean: 'boolean',
  ID: 'string',
}

const convertType = type => {
  if (type instanceof GraphQLNonNull) {
    return Object.assign(convertType(type.ofType), {
      required: true,
    })
  }

  if (type instanceof GraphQLList) {
    return {
      type: 'array',
      items: convertType(type.ofType),
    }
  }

  if (type instanceof GraphQLScalarType) {
    return {
      $ref: `#/definitions/${type.name}`,
      type: SCALARS[type.name],
    }
  }

  return { $ref: `#/definitions/${type.name}`, type: type.name }
}

module.exports = convertType
