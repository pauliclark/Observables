import OBJECT from '../Object.js'
import INTEGER from '../Integer.js'
import STRING from '../String.js'
import { register } from '../containers/models.js'
import UserRef from './UserReference.js'
const schema = {
  id: INTEGER,
  name: STRING,
  address: STRING,
  friend: UserRef
}
class User extends OBJECT {
  constructor (values) {
    super(schema, { values })
    store.User.add([this])
  }
}
const store = register({ User })
export default User
