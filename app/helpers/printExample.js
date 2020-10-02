const Handlebars = require('handlebars')

const common = require('../lib/common')

module.exports = (value, options) => {
  const cloned = value.schema
    ? Object.keys(value.schema.properties).reduce((acc, key) => {
        const cur = value.schema.properties[key]
        acc[key] = cur.type
        return acc
      }, {})
    : common.formatExample(value, options.data.root, options.hash)

  if (!cloned) {
    return ''
  }

  const html = common.printSchema(cloned, options.hash.yaml === true)
  return new Handlebars.SafeString(html)
}
