const fs = require('fs')
const url = require('url')
const yaml = require('js-yaml')
const axios = require('axios')
const graphql = require('graphql')
const graphToJSON = require('graphql-2-json-schema')

const makePaths = require('./makePaths')
const introspectionQuery = require('./introspectionQuery')

const fetchSchemas = async url => {
  const res = await axios.post(url, {
    query: introspectionQuery,
  })

  const jsonSchema = graphToJSON.fromIntrospectionQuery(res.data.data)
  const graphQLSchema = graphql.buildClientSchema(res.data.data, { assumeValid: true })

  return { jsonSchema, graphQLSchema }
}

module.exports = async specPath => {
  const fileContent = fs.readFileSync(specPath, 'utf8')
  const spec = yaml.safeLoad(fileContent)

  const { apiUrl, prodUrl, info, expandBlackList, defaultValues, groups = [] } = spec
  const { graphQLSchema, jsonSchema } = await fetchSchemas(apiUrl)

  const { host, protocol, pathname: basePath } = url.parse(prodUrl || apiUrl)

  const payload = {
    openapi: '3.0.0',
    info: {
      description: '',
      title: 'GraphQL docs',
      ...info,
    },
    servers: [{ url: prodUrl || apiUrl, description: 'Endpoint' }],
    host,
    schemes: [protocol.slice(0, -1)],
    basePath,
    externalDocs: spec.externalDocs,
    tags: groups.map(({ name, description, externalDocs }) => ({
      name,
      description,
      externalDocs,
    })),
    paths: makePaths(graphQLSchema, {
      groups,
      defaultValues: defaultValues.reduce((acc, cur) => ((acc[cur.name] = cur.value), acc), {}),
      expandBlackList: expandBlackList.reduce((acc, cur) => ((acc[cur] = 1), acc), {}),
    }),
    definitions: jsonSchema.definitions,
  }

  return payload
}
