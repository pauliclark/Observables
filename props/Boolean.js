
/**
 * The Observable BOOLEAN Class
 */
import Prop from './classes/Prop.js'
import OBJECT from './Object.js'
class BOOLEAN extends Prop {
  /**
 * @param {Boolean} value - The initial value of the Boolean
 * @param {Object} options
 * @param {OBJECT} options.parent - The Parent Object to which this Array is a member of
 * @param {String} options.name -The Name/key in the Parent Object to which this Array is assigned
 */
  constructor (value, { parent, name } = {}) {
    super(value, { parent, name })
  }

  /**
   * Removes the first item of the Array and returns that item
 * @param {Boolean} value - If true then the Change event is not fired
 * @returns {Boolean} value - The Observalbe Object of the item removed from the array
 */
  parse (value) {
    return value != null ? !!value : null
  }

  format () {
    return this.get() ? 'true' : 'false'
  }

  toggle () {
    this.set(!this.get())
  }
}

export default BOOLEAN
