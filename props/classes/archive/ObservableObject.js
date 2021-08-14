
import { buildProperties, assignProperties, updateProperties } from './ObservablePropertyBuilder'
import { baseObservable } from './BaseObservable'

class ObservableObject extends baseObservable {
  isObservable = true
  observable = 'Object'
  data = {}
  constructor (parent, { schema, props } = {}) {
    super(parent)
    buildProperties(this, schema)
    if (props) assignProperties(this, props, true)
  }
  constructorName = 'OBJECT'
  set (props, preventEvent = false) {
    // console.log(props)
    if (props) assignProperties(this, props, preventEvent)
  }
  async update (props, preventEvent = false) {
    // console.log(props)
    if (props) await updateProperties(this, props, preventEvent)
  }
  get () {
    return this.data
  }
  valueOf () {
    // let v = this.data._id || this.get()
    // let v = this.get()
    const op = {}
    Object.keys(this.data).forEach(key => {
      op[key] = this.data[key].valueOf ? this.data[key].valueOf() : this.data[key]
    })
    return op
  }
  toJSON () {
    const data = { ...this.get() }
    if (data._id && data._id.get() === null) delete data._id
    return data
  }
  equals (data) {
    if (data._id && this.data._id) return data._id.toString() === this.data._id.toString()
    const stripped = { ...this.get() }
    if (stripped._id) delete stripped._id
    return JSON.stringify(stripped) === JSON.stringify(data)
  }
  toObject () {
    return this.data
  }
}
export { ObservableObject }
