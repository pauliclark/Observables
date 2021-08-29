import REFERENCE from '../Reference.js'
import User from './User.js'
class UserRef extends REFERENCE {
  constructor (id, { parent, name } = {}) {
    super({ User }, { id, parent, name })
  }
}

export default UserRef
