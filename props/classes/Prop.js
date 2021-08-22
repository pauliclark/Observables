import { CHANGE } from './events.js'
import PropEvents from './PropEvents.js'

class Prop extends PropEvents {
  constructor ({ parent, name, value }) {
    super(parent)
    this.name = name
    this.value = value
    if (parent) {
      Object.defineProperty(parent, name, {
        get: () => {
          return this
        },
        set: (v) => {
          this.set(v)
        }
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

  get () {
    return this.value
  }

  format () {
    return this.value === null ? '' : this.value.toString()
  }

  parse (value) {
    return value
  }

  equals (data) {
    return (JSON.stringify(this.parse(data)) === JSON.stringify(this.value))
  }

  toString () {
    return this.format()
  }

  valueOf () {
    return this.get()
  }

  [Symbol.toPrimitive] (hint) {
    switch (hint) {
      case 'number':
        return this.value * 1
      case 'string':
        return this.value.toString()
      case 'default':
        return this.value
    }
    return this.get()
  }

  toJSON () {
    return this.valueOf()
  }
}
export default Prop
