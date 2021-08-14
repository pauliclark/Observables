
import * as ObservablePropTypes from './ObservablePropTypesCustom'
const ModelStore = {
  /* Registered models */
  models: {},
  /* Listeners by Model for pushed from client models */
  receivingTranspose: {},
  listeners: {},
  /* waiters - listening for models when they appear */
  waiters: {},
  /* Storage of model instances by model type */
  store: {},
  /* prop types - can be extended as per usage */
  propTypes: ObservablePropTypes,
  /* Defined the socket client and the registered models */
  init ({ client, models = {} } = { models: {} }) {
    Object.keys(models).forEach(model => {
      if (!this.models[model]) {
        this.models[model] = models[model]
        this.store[model] = {}
        this.receivingTranspose[model.replace(/[a-z][A-Z]/g, m => `${m[0]}_${m[1]}`).toLowerCase()] = model
      }
    })
    if (client && !this.client) {
      this.client = client
      if (this.client.registerModels) {
        this.client.registerModels(Object.keys(this.models).map(k => k.replace(/[a-z][A-Z]/g, m => `${m[0]}_${m[1]}`).toLowerCase()), (received) => this.receiver(received))
      }
      this.client.addListener('trigger', (data) => {
        this.triggers(data)
      })
    }
  },
  triggers (data) {
    Object.keys(data).forEach(key => {
      const ids = Object.keys(data[key])
      ids.forEach(id => {
        const method = data[key][id]
        // console.log(this.store[key][id], method)
        if (this.store[key] && this.store[key][id] && this.store[key][id][method]) this.store[key][id][method]()
      })
    })
  },
  async delete (instance) {
    return this.client.send('room', {
      deleteModel: {
        [instance.modelType]: {
          [instance._id]: instance
        }
      }
    })
  },
  filter (model, compare) {
    if (!this.store[model]) return null
    return Object.values(this.store[model]).filter(compare)
  },
  findById (model, id) {
    if (!this.store[model]) return undefined
    return this.store[model][id.toString()]
  },
  find (model, compare) {
    if (!this.store[model]) return null
    return Object.values(this.store[model]).find(compare)
  },
  fetch (models, callback) {
    // console.log(models)
    const types = Object.keys(models)
    const found = {}
    const waitFor = {}
    types.forEach(type => {
      if (this.store[type] && this.store[type][models[type]]) {
        found[type] = this.store[type][models[type]]
      } else {
        waitFor[type] = models[type]
      }
    })
    const wait = Object.keys(waitFor)
    wait.forEach(type => {
      if (!this.waiters[type]) this.waiters[type] = {}
      if (!this.waiters[type][waitFor[type]]) this.waiters[type][waitFor[type]] = []
      this.waiters[type][waitFor[type]].push(callback)
    })
    if (Object.keys(found).length) {
      callback(found)
    }
  },
  checkWaiter () {

  },
  buildListeners: {},
  listenForBuilds (model, method = () => { }, filter = (i) => { return true }) {
    if (!this.models[model]) throw new Error(`Model ${model} is not initiated in ModelStore`)
    if (!this.buildListeners[model]) this.buildListeners[model] = []
    this.buildListeners[model].push({ method, filter })
  },
  runBuildListeners (model, models = []) {
    // console.log({butuilListeners:{model, models}})
    if (this.buildListeners[model] && this.buildListeners[model].length) {
      // console.log({listeners:this.buildListeners[model]})
      for (let l = this.buildListeners[model].length - 1; l >= 0; l--) {
        let allFail = true
        models.forEach(item => {
          try {
            if (this.buildListeners[model][l].filter && this.buildListeners[model][l].filter(item)) {
              this.buildListeners[model][l].method(item)
            }
            allFail = false
          } catch (e) {
            console.error(e)
          }
        })
        if (allFail) this.buildListeners[model].splice(l, 1)
      }
    }
  },
  build (models) {
    // console.log({ models })
    const response = {}
    const modelsTypes = Object.keys(models)
    modelsTypes.forEach(model => {
      // console.log(model)
      if (!this.store[model]) this.store[model] = {}
      if (models[model]) {
        const newItems = models[model].filter(m => !this.store[model][m._id]).map(m => new this.models[model](m))
        const existingItems = models[model].filter(m => this.store[model][m._id]).map(m => this.store[model][m._id])
        response[model] = [...newItems, ...existingItems]
        // console.log([...response[model]])
        this.add([...newItems])
      } else {
        console.warn(`Model ${model} has not been initiated`)
      }
    })
    // console.log({ response })
    return response
  },
  add (items) {
    // console.log(this)
    if (!(items instanceof Array)) items = [items]
    items.forEach(item => {
      // console.log(item)
      if (item.modelType) {
        const model = item.modelType
        if (!this.store[model]) this.store[model] = {}
        if (!this.store[model][item._id.valueOf()]) {
          this.store[model][item._id.valueOf()] = item
          this.runBuildListeners(model, [item])
          if (this.waiters[model] && this.waiters[model][item._id.get()] && this.waiters[model][item._id.get()].length) {
            while (this.waiters[model][item._id.get()].length) {
              let fetchCallback = this.waiters[model][item._id.get()].shift()
              fetchCallback({ [model]: item })
            }
          }
          item.watch((v, fromUpdate) => {
            if (fromUpdate !== true) {
              this.sendChange(item)
            }
          })
        }
      }
    })
    this.recordLoaded()
  },
  // sentChanges: {},
  timeouts: {},
  sendChange (item) {
    // console.log(JSON.stringify(item))
    // console.log(item.constructor && item.constructor.name)
    if (item.modelType) {
      if (this.timeouts[item._id]) clearTimeout(this.timeouts[item._id])
      this.timeouts[item._id] = setTimeout(() => {
        delete this.timeouts[item._id]
        const changes = {}
        changes[item.modelType] = {}
        changes[item.modelType][item._id] = item
        // this.sentChanges[item.modelType][item._id] = true
        console.log(item, 'is saving')
        this.client.send('room', { updateModel: changes })
      }, 50)
    }
  },
  recordLoaded () {
    const loaded = {}
    Object.keys(this.store).forEach(model => {
      loaded[model] = Object.keys(this.store[model])
    })
    if (this.client) this.client.loaded(loaded)
  },
  receiver (received) {
    // console.log(received)
    const models = Object.keys(received)
    const newModels = {}
    models.forEach(model => {
      const modelName = this.receivingTranspose[model]
      // console.log({ modelName, modelNames: Object.keys(this.models) })
      if (this.models[modelName]) {
        // eslint-disable-next-line compat/compat
        const items = Object.values(received[model])
        items.forEach(item => {
          if (this.store[modelName][item._id]) {
            if (this.store[modelName][item._id].update) {
              // const fromChange = false// = this.sentChanges[modelName] && this.sentChanges[modelName][item._id]
              // if (fromChange) delete this.sentChanges[modelName][item._id]
              if (item.__deleted) {
                const deleting = this.store[modelName][item._id]
                delete this.store[modelName][item._id]
                deleting.deleted()
              } else {
                this.store[modelName][item._id].update(item)
              }
            } else {
              console.error(item, 'cannot find an update method')
            }
          } else if (!item.__deleted) {
            const newModel = new this.models[modelName](item)

            this.add(newModel)
            // this.store[modelName][item._id] = newModel
            if (!newModels[modelName]) newModels[modelName] = []
            newModels[modelName].push(newModel)
          }
        })
      }
    })
    Object.keys(newModels).forEach(model => {
      // this.runBuildListeners(model,newModels[model])
      this.triggerNewModel(model, newModels[model])
    })
  },
  addListenerForNew (model, callback) {
    if (!this.listeners[model]) this.listeners[model] = []
    this.listeners[model].push(callback)
  },
  triggerNewModel (model, items) {
    if (this.listeners[model]) {
      this.listeners[model].forEach(callback => {
        try {
          callback(items)
        } catch (e) {
          callback = null
        }
      })
      this.listeners[model] = this.listeners[model].filter(listener => listener)
    }
  }
}
window.ModelStore = ModelStore
export { ModelStore }
