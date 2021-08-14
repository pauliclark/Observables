import { ObservableObject } from './ObservableObject'
import { ModelStore } from './ModelStore'
import { confirm } from '../components/confirm'

class Observable extends ObservableObject {
  constructor({ schema, props }) {
    super(null, { schema, props })
    // this.watch(() => {
    // console.log(this, 'needs saving')
    // })
  }
}
export { Observable }
