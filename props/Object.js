import props from './index.js'
import { CHANGE } from './classes/events.js'
import PropEvents from './classes/PropEvents.js'
import INTEGER from './Integer.js'
import BOOLEAN from './Boolean.js'
import DATE from './Date.js'
import DECIMAL from './Decimal.js'
import STRING from './String.js'
// import TEXT from './Text.js'

const getProp = obj => {
  if (obj.isObservable) return [obj]
  if (typeof obj === 'string' && props[obj]) return [props[obj]]
  if (typeof obj === 'object') {
    if (Object.keys(obj).length === 1 && obj.type && props[obj.type]) {
      return [props[obj.type]]
    } else if (Object.keys(obj).length === 2 && obj.type && props[obj.type] && obj.value !== undefined) {
      return [props[obj.type], obj.value]
    } else {
      return [ObervableObject, obj]
    }
  }
  if (obj instanceof Date) return [DATE, obj]
  if (typeof obj === 'string') return [STRING, obj]
  if (typeof obj === 'number') {
    if (obj === parseInt(obj)) return [INTEGER, obj]
    return [DECIMAL, obj]
  }
  if (typeof obj === 'boolean') return [BOOLEAN, obj]
  return [null, obj]
}

class ObervableObject extends PropEvents {
  constructor (schema = {}, values, parent, name) {
    super(parent)
    if (parent && name) {
      parent[name] = this
      this.parent = parent
      this.name = name
    }
    this.buildFromSchema(schema)
    this.assign(values || {})
  }

  assign (values) {
    Object.keys(values).forEach(prop => {
      this[prop] = values[prop]
    })
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
    Object.entries(schema).forEach(([key, value]) => {
      // console.log(value)
      const [Prop, Value] = getProp(value)
      // console.log(Prop, Value)
      if (Prop) {
        if (Prop === ObervableObject) {
          this._values[key] = new Prop(Value, null, this, key)
        } else {
          this._values[key] = new Prop(this, key, Value)
        }
      } else {
        this._values[key] = Value
        Object.defineProperty(this, key, {
          get: () => {
            return this._values[key]
          },
          set: (v) => {
            this._values[key] = v
          }
        })
      }
    })
  }

  toJSON () {
    return this._values
  }
}
export default ObervableObject
