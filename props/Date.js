
import Prop from './classes/Prop.js'
class DATE extends Prop {
  parse (value) {
    return Date.parse(value)
  }
}

export default DATE
