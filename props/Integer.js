import Prop from './classes/Prop.js'
import { CHANGE } from './classes/events.js'
class INTEGER extends Prop {
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
