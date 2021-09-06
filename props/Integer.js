import Prop from './classes/Prop.js'
import { CHANGE } from './events/events.js'
/**
 * The Observable INTEGER Class
 */
class INTEGER extends Prop {
  /**
 * @param {Boolean} value - The initial value of the Decimal
 * @param {Object} options
 * @param {OBJECT} options.parent - The Parent Object to which this Decimal is a member of
 * @param {String} options.name -The Name/key in the Parent Object to which this Decimal is assigned
 */
  constructor (value, { parent, name } = {}) {
    super(value, { parent, name })
  }

  parse (value) {
    return value != null ? parseInt(value) : null
  }

  increment () {
    this.value++
    this[CHANGE]()
  }

  decrement () {
    this.value--
    this[CHANGE]()
  }
}

export default INTEGER
