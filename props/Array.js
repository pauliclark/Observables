
import PropEvents from './classes/PropEvents.js'
import INTEGER from './Integer.js'
import BOOLEAN from './Boolean.js'
import DATE from './Date.js'
import DECIMAL from './Decimal.js'
import STRING from './String.js'
import OBJECT from './Object.js'
class ARRAY extends PropEvents {
  constructor (schema = {}, values, parent, name) {
    super(parent)
    if (parent && name) {
      parent[name] = this
      this.parent = parent
      this.name = name
    }
    // this.buildFromSchema(schema)
    // this.assign(values || [])

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
    Object.defineProperty(this, 'schema', {
      get: () => {
        return this.extractSchema()
      },
      set: () => {}
    })
  }

  assign (values) {
    Object.keys(values).forEach(prop => {
      this[prop] = values[prop]
    })
  }
}

export default ARRAY
