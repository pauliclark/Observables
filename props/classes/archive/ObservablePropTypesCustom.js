
import * as ObservablePropTypes from '../models/ObservablePropTypes'
const { STRING, DATE, INTEGER, DECIMAL, BOOLEAN, REFERENCE, transposePropType } = ObservablePropTypes
import {User} from './User'

class NETWORK extends REFERENCE {
  constructor (parent, value) {
    super(parent, value, { modelType: 'Network' })
  }
  constructorName = 'NETWORK'
}
class ROLE extends REFERENCE {
  constructor (parent, value) {
    super(parent, value, { modelType: 'Role' })
  }
  constructorName = 'ROLE'
}
class VENUE extends REFERENCE {
  constructor (parent, value) {
    super(parent, value, { modelType: 'Venue' })
  }
  constructorName = 'VENUE'
}
class SPACE extends REFERENCE {
  constructor (parent, value) {
    super(parent, value, { modelType: 'Space' })
  }
  constructorName = 'SPACE'
}
class PHOTOLIBRARY extends REFERENCE {
  constructor (parent, value) {
    super(parent, value, { modelType: 'PhotoLibrary' })
  }
  constructorName = 'PHOTOLIBRARY'
}
class USER extends REFERENCE {
  constructor (parent, value) {
      if (value instanceof User) {
        value = value._id.valueOf()
      }else if (value instanceof Object && value._id) {
        value = value._id
      }
    super(parent, value, { modelType: 'User' })
  }
  constructorName = 'USER'
  update (user) {
    if (typeof user === 'string' && this.value !== user) {
      this.value = user
      this.ref = null
      this.changed(true)
    }else if (user instanceof User && this.value !== user._id.valueOf()) {
      this.ref = user
      this.value = user._id.valueOf()
      this.changed(true)
    }else if (user instanceof Object && user._id !== this.value) {
      this.ref = null
      this.value = user._id
      this.changed(true)
    }
  }
}
class SUBSCRIPTION extends REFERENCE {
  constructor (parent, value) {
    super(parent, value, { modelType: 'Subscription' })
  }
  constructorName = 'SUBSCRIPTION'
}

export {
  STRING,
  DATE,
  INTEGER,
  DECIMAL,
  BOOLEAN,
  REFERENCE,
  NETWORK,
  ROLE,
  VENUE,
  SPACE,
  USER,
  SUBSCRIPTION,
  PHOTOLIBRARY,
  transposePropType
}
