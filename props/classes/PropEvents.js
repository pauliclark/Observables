import events from '../events/events.js'
/**
 * The Prop Event Class
 */
class PropEvents {
  /**
 * @param {any} value - The initial value of the property
 * @param {OBJECT} parent - The Parent Object to which this Property is a member of ({@link Object})
 */
  constructor (parent) {
    this.parent = parent
    this._event = {}
    // this.isObservable = true
    this.eventCallbacks = Object.values(events).reduce((acc, key) => {
      acc[key] = []
      return acc
    }, {})
    Object.values(events).forEach(eventName => {
      this._event[eventName] = (target = this) => {
        this._processEvent(eventName, target)
      }
    })
  }
  /**
 * @ignore
 */
  static isObservable = true
  isObservable = true

  // static isObservable () {
  //   return true
  // }

  /**
   * Bind an event listener
 * @param {Event} eventName - The event being listening to, enumerated in the events file
 * @param {Function} callback - The method called when the event is fired
 */
  on (eventName, callback) {
    if (!(Object.values(events).includes(eventName))) throw new Error(`${eventName} is not a valid event`)
    if (!(callback instanceof Function)) throw new Error('Event listener is not a function')
    this.eventCallbacks[eventName].push(callback)
  }

  /**
   * Unbinds an event listener
 * @param {Event} eventName - The event being listening to, enumerated in the events file
 * @param {Function} callback - The method called when the event is fired
 */
  off (eventName, callback) {
    const idx = this.eventCallbacks[eventName].indexOf(callback)
    if (idx >= 0) this.eventCallbacks[eventName].splice(idx, 1)
  }

  /**
   * Calls event bubbling on the parent Observable
 * @param {Event} eventName - The event being listening to, enumerated in the events file
 * @param {Prop} target - The Prop that was the source of the Event
 */
  _bubble (eventName, target) {
    this._processEvent(eventName, target, { bubble: true })
  }

  /**
   * Calls the listeners for the Event triggered
 * @param {Event} eventName - The event being listening to, enumerated in the events file
 * @param {Prop} target - The Prop that was the source of the Event
 * @param {Object} [additional]
 * @param {Boolean} [additional.bubble = false] - A boolean that indicates that the event firing is bubbled from a child Prop
 */
  async _processEvent (eventName, target, { bubble = false } = { }) {
    if (!this.eventCallbacks[eventName]) throw new Error(`Cannot process event ${eventName}`)
    for (let c = this.eventCallbacks[eventName].length - 1; c >= 0; c--) {
      try {
        // console.log(eventName,target.toJSON())
        const response = await this.eventCallbacks[eventName][c](target, bubble)
        if (response === false) this.eventCallbacks[eventName].splice(c, 1)
      } catch (e) {
        this.eventCallbacks[eventName].splice(c, 1)
      }
    }
    if (this.parent && this.parent._bubble) {
      this.parent._bubble(eventName, target)
    }
  }
}
export default PropEvents
