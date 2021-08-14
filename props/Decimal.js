
import Prop from './classes/Prop.js'
class DECIMAL extends Prop {
  parse (value) {
    return value != null ? parseFloat(value) : null
  }
}

export default DECIMAL
