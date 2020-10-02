const { GraphQLObjectType, GraphQLNonNull, GraphQLList } = require('graphql')

const SCALARS = {
  Int: 'integer',
  Float: 'number',
  String: 'string',
  Boolean: 'boolean',
  ID: 'string',
}

const generateQueryInternal = (field, args, depth, typeCounts, { expandBlackList }) => {
  const space = '  '.repeat(depth)
  let queryStr = space + field.name

  const fieldArgs = [...args].map(a => ({ ...a, required: a.type.toString().endsWith('!') }))

  if (field.args && field.args.length > 0) {
    fieldArgs.push(...field.args)
    const argsStr = field.args.map(arg => `${arg.name}: $${arg.name}`).join(', ')
    queryStr += `(${argsStr})`
  }

  const returnType = field.type.ofType || field.type

  if (returnType.getFields) {
    let subQuery = null

    if (depth > 1) {
      const typeKey = `${field.name}->${returnType.name}`
      if (typeCounts.includes(typeKey)) {
        subQuery = space + '  ...Recursive' + returnType.name + 'Fragment\n'
      }

      typeCounts.push(typeKey)
    }

    const childFields = returnType.getFields()
    const keys = Object.keys(childFields)

    subQuery =
      subQuery ||
      keys
        .filter(k => !expandBlackList[k])
        .map(key => {
          return generateQueryInternal(childFields[key], fieldArgs, depth + 1, typeCounts, {
            expandBlackList,
          }).query
        })
        .join('')

    queryStr += ` {\n${subQuery}${space}}`
  }

  return {
    query: queryStr + '\n',
    args: fieldArgs,
  }
}

const generateExampleSchema = (name, type, depth) => {
  if (depth > 1) {
    return {
      type: 'object',
    }
  }

  if (type instanceof GraphQLObjectType) {
    const result = {
      type: 'object',
    }

    const fields = type.getFields()
    const keys = Object.keys(fields)

    result.properties = keys.reduce((p, key) => {
      const schema = generateExampleSchema(key, fields[key].type, depth + 1)

      if (schema) {
        p[key] = schema
      }

      return p
    }, {})

    return result
  }

  if (type instanceof GraphQLNonNull) {
    return generateExampleSchema(name, type.ofType, depth + 1)
  }

  if (type instanceof GraphQLList) {
    const schema = generateExampleSchema(name, type.ofType, depth)
    return schema
      ? {
          type: 'array',
          items: schema,
        }
      : null
  }

  return {
    type: SCALARS[type.name],
  }
}

const generateQuery = (parentType, field, { expandBlackList }) => {
  const schema = generateExampleSchema(field.name, field.type, 1)
  const queryResult = generateQueryInternal(field, [], 1, [], { expandBlackList })
  const argStr = queryResult.args
    .filter((item, pos) => queryResult.args.indexOf(item) === pos)
    .map(arg => `$${arg.name}: ${arg.type}`)
    .join(', ')

  const cleanedQuery = queryResult.query.replace(/ : [\w!\[\]]+/g, '')

  const query = `${parentType} ${field.name}${argStr ? `(${argStr})` : ''} {\n${cleanedQuery}}`

  const responseSchema = {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        properties: {},
      },
    },
  }

  responseSchema.properties.data.properties[field.name] = schema

  return {
    query,
    schema: responseSchema,
    args: queryResult.args.sort((a, b) => a.required - b.required),
  }
}

module.exports = generateQuery
