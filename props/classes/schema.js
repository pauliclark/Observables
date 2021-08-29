import SchemaError from './SchemaError.js'
import props, { typesFoundInSchema } from '../index.js'
import INTEGER from '../Integer.js'
import BOOLEAN from '../Boolean.js'
import DATE from '../Date.js'
import DECIMAL from '../Decimal.js'
import STRING from '../String.js'
import ARRAY from '../Array.js'
import OBJECT from '../Object.js'
// import TEXT from './Text.js'
const getProp = obj => {
  if (typesFoundInSchema.includes(obj)) return { Prop: obj }
  if (obj.isObservable) {
    return { Prop: obj }
  }
  if (typeof obj === 'string' && props[obj]) return { Prop: props[obj] }
  if (typeof obj === 'string') return { Prop: STRING, Value: obj }
  if (obj instanceof Date) return { Prop: DATE, Value: obj }
  if (typeof obj === 'number') {
    if (obj === parseInt(obj)) return { Prop: INTEGER, Value: obj }
    return { Prop: DECIMAL, Value: obj }
  }
  if (typeof obj === 'boolean') return { Prop: BOOLEAN, Value: obj }
  if (typeof obj === 'object') {
    if (Object.keys(obj).length === 1 && obj.type && props[obj.type]) {
      return { Prop: props[obj.type] }
    } else if (Object.keys(obj).length === 2 && obj.type && props[obj.type] && obj.value !== undefined) {
      return { Prop: props[obj.type], Value: obj.value }
    } else {
      return { Prop: OBJECT, Value: obj }
    }
  }
  if (obj === null) throw new SchemaError('A NULL value cannot be parsed in a Schema')
  throw new SchemaError(`Schema could not parse the entry ${obj}`)
}

const schema = s => {
  if (s instanceof Array) {
    if (!s.length) throw new SchemaError('An Array in a schema must contain a sub-schema for the containing objects')
    return s.map(i => schema(i))
  }
  if (s.isObservable) return s
  const structure = Object.keys(s).reduce((acc, key) => {
    const { Prop, Value } = getProp(s[key])
    acc[key] = { Prop, Value }
    if (acc[key].Prop === OBJECT) {
      acc[key] = schema(s[key])
    }
    return acc
  }, {})
  return structure
}
const TypeSchema = s => {
  if (s instanceof Array) {
    return s.map(TypeSchema)
  }
  if (s.isObservable) return s
  return Object.keys(s).reduce((acc, key) => {
    if (s[key] instanceof Array) {
      acc[key] = s[key].map(TypeSchema)
    } else {
      const { Prop } = s[key]
      if (!Prop) {
        acc[key] = TypeSchema(s[key])
      } else {
        acc[key] = Prop
      }
    }
    return acc
  }, {})
}
const ValueSchema = s => {
  if (s instanceof Array) {
    return s.map(ValueSchema)
  }
  return Object.keys(s).reduce((acc, key) => {
    if (s[key]) {
      if (s[key] instanceof Array) {
        acc[key] = s[key].map(ValueSchema)
      } else {
        const { Prop, Value } = s[key]
        if (!Prop) {
          acc[key] = ValueSchema(s[key])
        } else {
          acc[key] = Value
        }
      }
    }
    return acc
  }, {})
}
const TypesAndValues = s => {
  // console.log(s)
  const TAV = schema(s)
  // console.log(TAV)
  return [TypeSchema(TAV), ValueSchema(TAV)]
}
export default TypesAndValues
