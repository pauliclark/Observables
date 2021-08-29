const store = {}
const listeners = {}
class Store {
  constructor (name, model) {
    this.name = name
    this.Model = model
    this.models = {}
    this._referenceListeners = (listeners[this.name] && listeners[this.name].referenceModel instanceof Array) ? listeners[this.name].referenceModel : []
    delete listeners[this.name]
  }

  add (items = []) {
    while (items.length) {
      const item = items.shift()
      if (item instanceof this.Model && item._pKey) {
        this.models[item[item._pKey].toString()] = item
        const listeners = this._referenceListeners.filter(listener => listener.id === item._pKey)
        while (listeners.length) {
          const listener = listeners.shift()
          listener.resolve(item)
        }
        this._referenceListeners = this._referenceListeners.filter(listener => listener.id !== item._pKey)
      }
    }
  }

  filter (predictate) {
    return Object.values(this.models).filter(predictate)
  }

  findByPKey (id) {
    if (this.models[id.toString()]) return this.models[id.toString()]
    return null
  }

  referenceModel (id, resolve = () => {}) {
    if (!id) return resolve(null)
    if (resolve) {
      if (this.models[id.toString()]) {
        resolve(this.models[id.toString()])
      } else {
        this._referenceListeners.push({ id: id.toString(), resolve })
      }
    } else {
      if (this.models[id.toString()]) {
        return this.models[id.toString()]
      } else {
        return new Promise((resolve) => {
          this._referenceListeners.push({ id: id.toString(), resolve })
        })
      }
    }
  }
}
export const register = (models) => {
  try {
    Object.keys(models).forEach(name => {
      if (!store[name]) store[name] = new Store(name, models[name])
    })
  } catch (_e) {}
  return store
}
export const referenceModel = (model, id) => {
  // console.log(model, id)
  if (store[model]) {
    return new Promise((resolve, reject) => {
      store[model].referenceModel(id, resolve)
    })
  } else {
    return new Promise((resolve, reject) => {
      if (!listeners[model]) listeners[model] = {}
      if (!listeners[model].referenceModel) listeners[model].referenceModel = []
      listeners[model].referenceModel.push({ id: id.toString(), resolve })
    })
  }
}
export default store
