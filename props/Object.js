import props, { typesFoundInSchema } from './index.js'
import { CHANGE } from './classes/events.js'
import PropEvents from './classes/PropEvents.js'
import schemaBuilder from './classes/schema.js'
import INTEGER from './Integer.js'
import BOOLEAN from './Boolean.js'
import DATE from './Date.js'
import DECIMAL from './Decimal.js'
import STRING from './String.js'
import ARRAY from './Array.js'
// import TEXT from './Text.js'

// const getProp = obj => {
//   if (obj.isObservable) return [obj]
//   if (typeof obj === 'string' && props[obj]) return [props[obj]]
//   if (typeof obj === 'string') return [STRING, obj]
//   if (typeof obj === 'object') {
//     if (Object.keys(obj).length === 1 && obj.type && props[obj.type]) {
//       return [props[obj.type]]
//     } else if (Object.keys(obj).length === 2 && obj.type && props[obj.type] && obj.value !== undefined) {
//       return [props[obj.type], obj.value]
//     } else {
//       return [OBJECT, obj]
//     }
//   }
//   if (obj instanceof Date) return [DATE, obj]
//   if (typeof obj === 'number') {
//     if (obj === parseInt(obj)) return [INTEGER, obj]
//     return [DECIMAL, obj]
//   }
//   if (typeof obj === 'boolean') return [BOOLEAN, obj]
//   return [null, obj]
// }

// const PropToSchemaType = prop => {
//   if (prop instanceof INTEGER) return INTEGER
//   if (prop instanceof DECIMAL) return DECIMAL
//   if (prop instanceof BOOLEAN) return BOOLEAN
//   if (prop instanceof DATE) return DATE
//   if (prop instanceof STRING) return STRING
//   if (prop instanceof ARRAY) return [prop.schema]
//   if (prop instanceof OBJECT) return prop.schema
//   return null
// }

class OBJECT extends PropEvents {
  constructor (sourceSchema = {}, { values, parent, name } = {}) {
    super(parent)
    const [schema, schemaValues] = schemaBuilder(sourceSchema)
    // console.log(schemaValues)
    this.schema = schema
    if (parent && name) {
      parent[name] = this
      this.parent = parent
      this.name = name
    }
    this.buildFromSchema(schema)
    this.assign(values || schemaValues)

    if (parent) {
      Object.defineProperty(parent, name, {
        get: () => {
          return this
        },
        set: (v) => {
          this.assign(v)
        }
      })
    }
  }

  assign (values) {
    // console.log(values)
    if (values) {
      Object.keys(values).forEach(prop => {
        this[prop] = values[prop]
      })
    }
  }

  set (value, { preventEvent = false } = {}) {
    const oldValue = this.value
    const newValue = this.parse(value && value.valueOf ? value.valueOf() : value)
    this.value = newValue
    if (!preventEvent && newValue !== oldValue) {
      this[CHANGE]()
    }
  }

  buildFromSchema (schema) {
    this._values = {}
    Object.entries(schema).forEach(([key, Prop]) => {
      // console.log(value)
      // const [Prop, Value] = getProp(value)
      // console.log(Prop, Value)
      if (Prop) {
        if (typesFoundInSchema.includes(Prop)) {
          this._values[key] = new Prop({
            parent: this,
            name: key
          })
        } else if (Prop instanceof Array) {
          this._values[key] = new ARRAY(Prop[0], {
            parent: this,
            name: key
          })
        } else {
          this._values[key] = new OBJECT(Prop, {
            parent: this,
            name: key
          })
        }
      }
    })
  }

  toJSON () {
    return this._values
  }
}
export default OBJECT
