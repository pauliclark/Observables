
import Prop from './classes/Prop.js'
class STRING extends Prop {
  parse (value) {
    return value != null ? value.toString() : null
  }
}

export default STRING
