import { $, idRepo } from 'venuescanner-js/tools/elemental'
/*
  Base Class for Observable Property types
  To be extended by other classes
*/

import { baseObservable } from './BaseObservable'
class ObservablePropType extends baseObservable {
  value = null
  type = 'element'
  watchers = []
  constructor (parent, value, options = {}) {
    super(parent)
    this.options = options || {}
    this.set(value, true)
    // console.log(this.options)
  }
  observable = 'PropType'
  constructorName = 'ObservablePropType'
  /* Base method for formatting options to override */
  format () {
    return this.value === null ? '' : this.value
  }
  parse (value) {
    return value
  }
  equals (data) {
    return (JSON.stringify(this.parse(data)) === JSON.stringify(this.value))
  }
  /* Set the value and parse */
  set (value, preventEvent) {
    const oldValue = this.value
    const newValue = this.parse(value && value.valueOf ? value.valueOf() : value)
    this.value = newValue
    if (!preventEvent && newValue !== oldValue) {
      this.changed()
    }
  }
  /* Called by an update received from the server */
  update (value) {
    const oldValue = this.value
    const newValue = this.parse(value && value.valueOf ? value.valueOf() : value)
    this.value = newValue
    if (newValue !== oldValue) {
      this.changed(true)
    }
  }
  /* Return the parsed value */
  get () {
    return this.value
  }
  toString () {
    return this.get()
  }
  valueOf () {
    return this.get()
  }
  /* DOM Input element */
  element = () => `<vs-input vs-id='${idRepo()}'></vs-input>`
  elementValue (element) {
    let val = this.get()
    try {
      if (element.checked !== undefined) {
        element.checked = val
      } else {
        element.value = val
      }
    } catch (e) {
      console.error(e)
    }
  }
  input () {
    const ipHTML = this.element()
    const ip = $(ipHTML).get(0)
    // console.log(ip, ipHTML)
    $(ip).bind('switched', (e) => {
      this.set(e.detail)
    })
    $(ip).bind('vschange', (e) => {
      this.set(e.detail)
    })
    this.elementValue(ip)
    this.watch(val => {
      // ip.value = val
      this.elementValue(ip)
    })
    return ip
  }
  render () {
    const ip = document.createTextNode(this.format())
    this.watch(val => {
      ip.textContent = this.format()
    })
    return ip
  }
  toJSON () {
    return this.valueOf()
  }
}
export { ObservablePropType }
