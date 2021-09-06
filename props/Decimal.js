
import Prop from './classes/Prop.js'
/**
 * The Observable DECIMAL Class
 */
class DECIMAL extends Prop {
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
    return value != null ? parseFloat(value) : null
  }
}

export default DECIMAL
