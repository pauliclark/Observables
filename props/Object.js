// import props from './index.js'
// import { CHANGE } from './events/events.js'
import PropEvents from './classes/PropEvents.js'
import schemaBuilder from './classes/schema.js'
// import INTEGER from './Integer.js'
// import BOOLEAN from './Boolean.js'
// import DATE from './Date.js'
// import DECIMAL from './Decimal.js'
// import STRING from './String.js'
import ARRAY from './Array.js'

/**
 * The Observable OBJECT Class
 */
class OBJECT extends PropEvents {
  /**
 * @param {Boolean} value - The initial value of the Decimal
 * @param {Object} options
 * @param {OBJECT} options.parent - The Parent Object to which this Decimal is a member of
 * @param {String} options.name -The Name/key in the Parent Object to which this Decimal is assigned
 */
  constructor (sourceSchema = {}, { values, parent, name } = {}) {
    super(parent)
    const [schema, schemaValues] = schemaBuilder(sourceSchema)
    // console.log(schemaValues)
    this.schema = schema
    // if (parent && name) {
    //   parent[name] = this
    //   this.parent = parent
    //   this.name = name
    // }
    this.buildFromSchema(schema)
    this.assign(values || schemaValues)

    if (parent && name) {
      this.name = name
      Object.defineProperty(parent, name, {
        get: () => {
          return this
        },
        set: (v) => {
          this.assign(v)
        }
      })
    }
    this._pKey = this.schema._id
      ? '_id'
      : (
          this.schema.id ? 'id' : Object.keys(this.schema).shift()
        )
  }

  assign (values, { preventEvent = false } = {}) {
    // console.log(values)
    if (values) {
      Object.keys(values).forEach(prop => {
        // if (prop === 'friend') console.log({ friend: values[prop] })
        this[prop]._set(values[prop], { preventEvent })
      })
    }
  }

  _set (value, { preventEvent = false } = {}) {
    this.assign(value, { preventEvent })
  }

  buildFromSchema (schema) {
    this._values = {}
    Object.entries(schema).forEach(([key, Prop]) => {
      // console.log(value)
      // const [Prop, Value] = getProp(value)
      // console.log(Prop, Value)
      if (Prop) {
        if (Prop.isObservable) {
          this._values[key] = new Prop(null, {
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
