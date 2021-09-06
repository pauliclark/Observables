import Prop from './classes/Prop.js'
import { LOAD } from './events/events.js'
import { referenceModel } from './containers/models.js'
class REFERENCE extends Prop {
  constructor (model, { id, parent, name } = {}) {
    super(id, { parent, name })
    if (Object.keys(model).length !== 1) throw new Error('Reference model in constructor must have one key e.g. {User}')
    this.modelName = Object.keys(model).pop()
    this.model = model[this.modelName]
    this._ref = null
    if (id) {
      referenceModel(this.modelName, id).then(ref => {
        this._attachRef(ref)
      })
    }

    if (parent && name) {
      Object.defineProperty(parent, `_${name}`, {
        get: () => {
          return this._ref
        }
      })
    }
  }

  _preChange () {
    this._ref = null
    // console.log({id:this.value})
    if (this.value) {
      referenceModel(this.modelName, this.value).then(ref => {
        this._attachRef(ref)
        // this.processEvent(LOAD, this, { bubble: true })
      })
    }
  }

  getRef () {
    if (this._ref) {
      return Promise.resolve(this._ref)
    } else {
      return new Promise((resolve) => {
        this.on(LOAD, () => {
          resolve(this._ref)
        })
      })
    }
  }

  _attachRef (ref) {
    this._ref = ref
    this._processEvent(LOAD, this, { bubble: true })
  }

  get () {
    return this._ref
  }

  valueOf () {
    return this.value
  }
}

export default REFERENCE
