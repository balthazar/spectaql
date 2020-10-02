const makeExample = require('./makeExample')
const convertType = require('./convertType')

const getFields = type => {
  if (!type) {
    return null
  }

  const fields = type.getFields()
  return Object.keys(fields).map(k => fields[k])
}

module.exports = (graphQLSchema, { groups, defaultValues, expandBlackList }) => {
  const result = {}
  const queries = getFields(graphQLSchema.getQueryType())
  // const mutations = getFields(graphQLSchema.getMutationType())

  ;[...queries].forEach(q => {
    const group = groups.find(g => new RegExp(`.*${g.match || g.name}.*`, 'i').test(q.name))

    const example = makeExample('query', q, { expandBlackList })
    const responseSchema = convertType(q.type)

    const initialArgs = (example.args || []).map(({ name, description, type }) => ({
      name,
      description,
      in: 'query',
      schema: convertType(type),
    }))

    const args = [
      ...initialArgs,
      {
        in: 'body',
        example: example.query,
        schema: !initialArgs.length
          ? null
          : {
              type: 'object',
              properties: initialArgs.reduce((cur, next) => {
                cur[next.name] = {
                  ...next.schema,
                  type: defaultValues[next.name] || next.schema.type || '',
                }

                return cur
              }, {}),
            },
      },
    ]

    result[q.name] = {
      post: {
        tags: [group ? group.name : 'Other'],
        summary: q.name,
        description: q.description,
        operationId: q.name,
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: args,
        responses: {
          '200': {
            description: 'Successful operation',
            schema: responseSchema,
          },
        },
      },
    }
  })

  return result
}
