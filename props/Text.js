import Prop from './classes/Prop.js'
class TEXT extends Prop {
  parse (value) {
    return value != null ? value.toString() : null
  }
}

export default TEXT
