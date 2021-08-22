import events from './events.js'
class PropEvents {
  constructor (parent) {
    this.parent = parent
    this._event = {}
    this.eventCallbacks = Object.values(events).reduce((acc, key) => {
      acc[key] = []
      return acc
    }, {})
    Object.values(events).forEach(eventName => {
      this._event[eventName] = (target = this) => {
        this.processEvent(eventName, target)
      }
    })
  }
  isObservable = true
  on (eventName, callback) {
    if (!(Object.values(events).includes(eventName))) throw new Error(`${eventName} is not a valid event`)
    if (!(callback instanceof Function)) throw new Error('Event listener is not a function')
    this.eventCallbacks[eventName].push(callback)
  }
  off (eventName, callback) {
    const idx = this.eventCallbacks[eventName].indexOf(callback)
    if (idx>=0) this.eventCallbacks[eventName].splice(idx,1)
  }

  bubble (eventName, target) {
    this.processEvent(eventName, target, { bubble: true })
  }

  async processEvent (eventName, target, { bubble = false } = { }) {
    if (!this.eventCallbacks[eventName]) throw new Error(`Cannot process event ${eventName}`)
    for (let c = this.eventCallbacks[eventName].length - 1; c >= 0; c--) {
      try {
        // console.log(eventName,target.toJSON())
        const response = await this.eventCallbacks[eventName][c](target,bubble)
        if (response === false) this.eventCallbacks[eventName].splice(c, 1)
      } catch (e) {
        this.eventCallbacks[eventName].splice(c, 1)
      }
    }
    if (this.parent?.bubble) {
      this.parent.bubble(eventName, target)
    }
  }
}
export default PropEvents
