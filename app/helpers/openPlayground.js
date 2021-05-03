const Handlebars = require('handlebars')

const common = require('../lib/common')

module.exports = (value, options) => {
  const baseUrl = options.data.root.servers[0].url
  const query = value.example
  const variables = JSON.stringify(
    Object.keys(value.schema.properties).reduce((acc, key) => {
      const variable = value.schema.properties[key]
      acc[key] = variable.type
      return acc
    }, {}),
  )

  const tabs = [
    {
      endpoint: baseUrl,
      query,
      variables,
      headers: {
        'X-APIKEY': 'Change this',
      },
    },
  ]

  const url = `${baseUrl}?tabs=${encodeURIComponent(JSON.stringify(tabs))}`

  return new Handlebars.SafeString(`<a href="${url}" target="_blank">Open in playground<a/>\n`)
}
