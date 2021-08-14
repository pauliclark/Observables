import props from './index.js'

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
  if (typeof obj === 'object' && obj.type && props[obj.type]) return [props[obj.type],obj.value]
  if (obj instanceof Date) return [DATE, obj]
  if (typeof obj === 'string') return [STRING,obj]
  if (typeof obj === 'number') {
    if (obj === parseInt(obj)) return [INTEGER,obj]
    return [DECIMAL,obj]
  }
  if (typeof obj === 'boolean') return [BOOLEAN,obj]
  return [null,obj]

}

class ObervableObject extends PropEvents {
  constructor(schema = {}, values = {}, parent, name) {
    super(parent)
    if (parent && name) {
      parent[name] = this
      this.parent = parent
      this.name = name
    }
    this.buildFromSchema(schema)
    Object.keys(values).forEach(prop => {
      this[prop] = values[prop]
    })
  }
  buildFromSchema (schema) {
    Object.entries(schema).forEach(([key,value]) => {
      // console.log(value)
      const [Prop, Value] = getProp(value)
      // console.log(Prop, Value)
      if (Prop) {
        new Prop(this,key,Value)
      }else{
        this[key] = Value
      }
    })
  }
}
export default ObervableObject
