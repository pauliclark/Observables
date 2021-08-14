
import Prop from './classes/Prop.js'
class BOOLEAN extends Prop {
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
