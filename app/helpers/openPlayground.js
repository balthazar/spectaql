const Handlebars = require('handlebars')

const common = require('../lib/common')

module.exports = (value, options) => {
  const query = value.example
  const variables = JSON.stringify(
    Object.keys(value.schema.properties).reduce((acc, key) => {
      const variable = value.schema.properties[key]
      acc[key] = variable.type
      return acc
    }, {}),
  )

  const variablesQuery = variables ? `&variables=${encodeURIComponent(variables)}` : ''

  const url = `${options.data.root.servers[0].url}?query=${encodeURIComponent(
    query,
  )}${variablesQuery}`

  return new Handlebars.SafeString(`<a href="${url}" target="_blank">Open in playground<a/>\n`)
}
