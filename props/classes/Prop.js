import { CHANGE } from '../events/events.js'
import PropEvents from './PropEvents.js'

/**
 * The Observable Prop Class
 */
class Prop extends PropEvents {

  /**
 * @param {any} value - The initial value of the property
 * @param {Object} options
 * @param {OBJECT} options.parent - The Parent Object to which this Property is a member of
 * @param {String} options.name -The Name/key in the Parent Object to which this Property is assigned
 */
  constructor (value, { parent, name, options = {} } = {}) {
    super(parent)
    this.name = name
    // console.log(value)
    if (parent && name) {
      Object.defineProperty(parent, name, {
        get: () => {
          return this
        },
        set: (v) => {
          this._set(v)
        }
      })
    }
    if (this._setOptions) {
      this._setOptions(options)
    }
    this._set(value, { preventEvent: true })
  }


  static isProp = true
  _set (value, { preventEvent = false } = {}) {
    const oldValue = this.value
    const newValue = this.parse(value)
    this.value = newValue
    if (newValue !== oldValue) {
      if (this._preChange) this._preChange()
    }
    if (!preventEvent && newValue !== oldValue) {
      // console.log({ CHANGE })
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
