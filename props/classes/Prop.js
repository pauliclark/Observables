import { CHANGE } from './events.js'
import PropEvents from './PropEvents.js'

class Prop extends PropEvents {
  constructor (parent, name, value) {
    super(parent)
    this.parent = parent
    this.name = name
    this.value = value
    Object.defineProperty(parent, name, {
      get: () => {
        return this
      },
      set: (v) => {
        return this.set(v)
      }
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

  get () {
    return this.value
  }

  format () {
    return this.value === null ? '' : this.value
  }

  parse (value) {
    return value
  }

  equals (data) {
    return (JSON.stringify(this.parse(data)) === JSON.stringify(this.value))
  }

  toString () {
    return this.get()
  }

  valueOf () {
    return this.get()
  }
  
  toPrimitive () {
    return this.get()
  }

  toJSON () {
    return this.valueOf()
  }
}
export default Prop
