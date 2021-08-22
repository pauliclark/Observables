class SchemaError extends Error {
  constructor (...args) {
    super(...args)
    this.name = 'SchemaError'
  }
}
export default SchemaError
