import { CHANGE } from './events.js'
import PropEvents from './PropEvents.js'

class Prop extends PropEvents {
  constructor (value, { parent, name, options = {} } = {}) {
    super(parent)
    this.name = name
    // console.log(value)
    if (parent) {
      Object.defineProperty(parent, name, {
        get: () => {
          return this
        },
        set: (v) => {
          this._set(v)
        }
      })
    }
    if (this.setOptions) {
      this.setOptions(options)
    }
    this._set(value, { preventEvent: true })
  }

  _set (value, { preventEvent = false } = {}) {
    const oldValue = this.value
    const newValue = this.parse(value)
    this.value = newValue
    if (!preventEvent && newValue !== oldValue) {
      console.log({ CHANGE })
      this._event[CHANGE]()
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
    // console.log(this.value)
    return this.valueOf()
  }
}
export default Prop
