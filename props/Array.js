
import PropEvents from './classes/PropEvents.js'
// import props from './index.js'
import { CHANGE } from './events/events.js'
import OBJECT from './Object.js'
import schemaBuilder from './classes/schema.js'
const makeIterator = (array) => {
  let nextIndex = 0
  return {
    next: function () {
      return nextIndex < array.length
        ? {
            value: array[nextIndex++],
            done: false
          }
        : {
            done: true
          }
    }
  }
}
/**
 * The Observable ARRAY Class
 */
class ARRAY extends PropEvents {
  /**
 * @param {Schema} sourceSchema - The Schema to be used as the shape of the items in the Array
 * @param {Object} options
 * @param {Object[]} options.values - The Array of initial values that will be consumed as Observables according to the Schema
 * @param {Object} options.parent - The Parent Object to which this Array is a member of
 * @param {String} options.name -The Name/key in the Parent Object to which this Array is assigned
 */
  constructor (sourceSchema = null, { values, parent, name } = {}) {
    super(parent)
    this._values = []
    this._schema = null
    if (sourceSchema) {
      const [[schema], schemaValues] = schemaBuilder(!(sourceSchema instanceof Array) ? [sourceSchema] : sourceSchema)
      // console.log({ schema })
      this._schema = schema
      // append schemaValues
      this._assign(values || schemaValues)
    }
    if (parent && name) {
      parent[name] = this
      this._name = name
    }
    // this.buildFromSchema(schema)
    // this.assign(values || [])

    if (parent) {
      Object.defineProperty(parent, name, {
        get: () => {
          return this
        },
        set: (v) => {
          this._assign(v)
        }
      })
    }
    Object.defineProperty(this, 'length', {
      get: () => {
        return this.getLength()
      },
      set: (v) => {}
    })
  }

  [Symbol.iterator] () { return makeIterator(this._values) }

  _itemProp () {
    if (this._schema.isObservable) {
      return this._schema
    } else if (this._schema instanceof Array) {
      return ARRAY
    } else {
      return OBJECT
    }
  }

  _assign (values) {
    const Prop = this._schema ? this._itemProp() : null
    if (!(values instanceof Array)) values = [values]
    // console.log({ Prop, values })
    this._values = values.map(val => {
      if (Prop) {
        if (this._schema.isObservable) {
          return new Prop(val, { parent: this })
        } else if (Prop === ARRAY) {
          return new ARRAY(this._schema[0], { parent: this, values: val })
        } else if (Prop === OBJECT) {
          return new OBJECT(this._schema, { parent: this, values: val })
        }
      }
      return null
    }).filter(v => v)
    // console.log(this._values)
  }

  _newItem (props) {
    if (this._schema) {
      const Prop = this._itemProp()
      if (this._schema.isObservable) {
        return new Prop(props, { parent: this })
      } else if (Prop === ARRAY) {
        return new ARRAY(this._schema[0], { parent: this, values: props })
      } else if (Prop === OBJECT) {
        return new OBJECT(this._schema, { parent: this, values: props })
      }
    }
  }

  _changed () {
    this._event[CHANGE]()
  }

  /**
   * Pushes an item onto the Array
 * @param {Object} props - The Object of values that obeys the item Schema
 * @param {Boolean} [preventDefault=false] - If true then the Change event is not fired
 */
  push (props, preventDefault = false) {
    this._values.push(this._newItem(props))
    if (!preventDefault) this._changed()
  }

  /**
   * Removes the first item of the Array and returns that item
 * @param {Boolean} [preventDefault=false] - If true then the Change event is not fired
 * @returns {Object} item - The Observalbe Object of the item removed from the array
 */
  shift (preventDefault = false) {
    const r = this._values.shift()
    if (!preventDefault) this._changed()
    return r
  }

  /**
   * Removes the last item of the Array and returns that item
 * @param {Boolean} [preventDefault=false] - If true then the Change event is not fired
 * @returns {Object} item - The Observalbe Object of the item removed from the array
 */
  pop (preventDefault = false) {
    const r = this._values.pop()
    if (!preventDefault) this._changed()
    return r
  }

  /**
   * Removes a range of items from the Array and returns them
 * @param {Integer} idx - The index of the first item to be removed
 * @param {Integer} toremove - The number of items to be removed
 * @param {Object[]} [props = []] - The array of objects (obeying the Schema) to inserted in the resulting gap
 * @param {Boolean} [preventDefault=false] - If true then the Change event is not fired
 * @returns {Object[]} items - The Observalbe Objects of the items removed from the array
 */
  splice (idx, toremove, props = [], preventDefault = false) {
    if (!(props instanceof Array)) props = [props]
    const r = this._values.splice(idx, toremove, props.map(prop => this._newItem(prop)))
    if (!preventDefault) this._changed()
    return r
  }

  /**
   * Returns a range of items from the Array
 * @param {Integer} idxFrom - The index of the first item to be selected
 * @param {Integer} idxTo - The index of the last item to be selected
 * @returns {Object[]} items - The Observalbe Objects of the items selected from the array
 */
  slice (idxFrom, idxTo) {
    const r = this._values.slice(idxFrom, idxTo)
    return r
  }

  /**
   * Removes any matching Items from the Array
 * @param {Object[]} items - An Array of Observable Objects/Items to be removed
 * @param {Boolean} [preventDefault=false] - If true then the Change event is not fired
 * @returns {Boolean} success - True if any of the Items were found and removed
 */
  remove (items, preventDefault = false) {
    if (!(typeof items instanceof Array)) items = [items]
    let success = false
    const vals = this._values
    for (let v = vals.length - 1; v >= 0; v--) {
      if (items.includes(vals[v])) {
        this._values.splice(v, 1)
        vals.splice(v, 1, true)
        success = true
      }
    }
    if (success && !preventDefault) this._changed()
    return success
  }

  /**
   * Returns an Array of the matching items found in the Array according to the provided method
 * @param {function(item: Object): Boolean} method - The predictate method for filtering the items
 * @returns {Boolean} success - True if any of the Items were found and removed
 */
  filter (method) {
    if (!(method instanceof Function)) return this._values
    return this._values.filter(method)
  }

  /**
   * Finds a matching item in the Array according to the provided method
 * @param {function(item: Object): Boolean} method - The predictate method for matching the item
 * @returns {Object} item - The found Observable Item
 */
  find (method) {
    if (!(method instanceof Function)) return this._values
    return this._values.find(method)
  }

  /**
   * Moves an item from one index to another
 * @param {Object} indexes
 * @param {Integer} indexes.from - The index of the item to move
 * @param {Integer} indexes.to - The index in the Array to move the item to
 * @param {Boolean} [preventDefault=false] - If true then the Change event is not fired
 */
  moveItem ({ from, to }, preventDefault = false) {
    if (from < to) {
      to--
    }
    this._values.splice(to, 0, this._values.splice(from, 1)[0])
    if (!preventDefault) this._changed()
  }

  /**
   * Returns the index of the provided Observable Item
 * @param {Object} item - The Observable Item to return the index of
 * @returns {Integer} index - The index of the found Observable Item
 */
  indexOf (item) {
    return this._values.indexOf(item)
  }

  /**
   * Returns a transposed Array
 * @param {function(item: Object): Object} method - The transposing method applied to each item in the Array
 * @returns {Object[]} items - The Array of transposed Items
 */
  map (method) {
    return this._values.map(method)
  }

  /**
   * Loop through the Array
 * @param {function(item: Object)} method - The method to be run on each Item
 */
  forEach (method) {
    return this._values.forEach(method)
  }

  /**
   * Reverses the Array order
 * @param {Boolean} [preventDefault=false] - If true then the Change event is not fired
 * @returns {Object[]} items - The new reversed Array of Items
 */
  reverse (preventDefault = false) {
    this._values = this._values.reverse()
    if (!preventDefault) this._changed()
    return this._values
  }

  /**
   * Determines if the provided item is in the Array
 * @param {Object|String|Number|Boolean} value - The value of an item (according to the Schema) to check for
 * @returns {Boolean} found - True if the item/value has been found
 */
  includes (value) {
    const toCheck = (value && value.get ? value.get() : (value.valueOf ? value.valueOf() : value))
    return !!this._values.find(val => {
      return (val && val.get ? val.get() : (val && val.valueOf ? val.valueOf() : val)) === toCheck
    })
  }

  /**
   * Returns the Observable Item by the Index
 * @param {Integer} [idx=null] - The Index of the item to return (if null, all items are returned)
 * @returns {Object} item - The item found at the requested index
 */
  get (idx = null) {
    return idx === null
      ? this._values
      : (
          idx >= this._values.length ? null : this._values[idx]
        )
  }

  /**
   * Sets the internal array of items
 * @param {Object[]} [props=[]] - The array of objects to construct the Observable Items (according to the Schema)
 * @param {Boolean} [preventDefault=false] - If true then the Change event is not fired
 * @returns {Object[]} items - The new array of Observable Items
 */
  set (props = [], preventDefault = false) {
    // console.log(props, this.getKey())
    if (!(props instanceof Array)) {
      // console.log({props})
      throw new Error('Expected Array in props')
    }
    // const Schema = this._schema
    // console.log({props})
    this._values = props.map(p => {
      // if (typeof Schema === 'function' && p instanceof Schema ) return p
      return this._newItem(p)
    })
    // if (!this._schema) console.log(this._values)
    // console.log(this)
    if (!preventDefault) this._changed()
    return this._values
  }

  _arrayState () {
    return JSON.stringify(this._values.sort((a, b) => {
      if (a._id) {
        return a._id - b._id
      } else {
        return a - b
      }
    }))
  }

  /**
   * Update the items within the Array. If an item has the same prop *_id*, then the item reference is preserved and the props are updated
 * @param {Object[]} [props=[]] - The array of objects to construct the Observable Items (according to the Schema)
 * @param {Boolean} [preventDefault=false] - If true then the Change event is not fired
 * @returns {Object[]} items - The new array of Observable Items
 */
  update (props, preventDefault = false) {
    if (!(props instanceof Array)) throw new Error('Expected Array in props')
    const currentLength = this._values.length
    // const currentState = this.arrayState()
    const foundItems = []
    let idx = 0
    // const list = []
    let isReordered = false

    while (props.length > 0) {
      const data = props.shift()
      let foundItem = this._values.find(v => {
        return v.equals(data)
      })
      if (data._id && !foundItem) {
        foundItem = this._values.find(v => {
          // console.log(v._id.valueOf())
          return (!v._id || !v._id.valueOf()) && (!foundItems.includes(v))
        })
      }
      if (foundItem) {
        foundItems.push(foundItem)
        foundItem.update(data, preventDefault)
        if (this._values.indexOf(foundItem) !== idx) isReordered = true
      } else {
        const _newItem = this._newItem(data)
        foundItems.push(_newItem)
        // this._values.push(_newItem)
      }
      // } else {

      // }
      idx++
    }
    // console.log(this.getKey())
    // console.log(JSON.parse(JSON.stringify(foundItems)))
    this._values = foundItems
    // for (let l = this._values.length - 1; l >= 0; l--) {
    //   if (!foundItems.includes(this._values[l])) this._values.splice(l, 1)
    // }

    // const newState = this.arrayState()
    // if (this.getKey() === 'pending_invite') {
    // console.log(props)
    // }
    const newLength = this._values.length
    // console.log(currentLength , newLength)
    if (!preventDefault && (isReordered || currentLength !== newLength)) this._changed(true)
    // if (!preventDefault && currentState !== newState) this._changed(true)
    return this._values
  }

  /**
   * Returns the length of the Array. Used by the virtual property *length*
 * @returns {Integer} length - The number of items in the Array
 */
  getLength () {
    return this._values.length
  }

  /**
   * Returns an Array of the parsed values of each item
 * @returns {Object[]} values - Array of primitive item values
 */
  valueOf () {
    return this._values.map(r => r.valueOf ? r.valueOf() : r)
  }

  /**
   * Returns the Array of Observable Items
 * @returns {Object[]} items - Array of Observable Items
 */
  toJSON () {
    return this._values
  }

  /**
   * Returns the Array of Objects
 * @returns {Object[]} objects - Array of Objects
 */
  toObject () {
    return this._values.map(r => r.toObject ? r.toObject() : r)
  }

  /**
   * Reorders the Array
 * @param {function(a: Object, b: Object): Integer} sortMethod - The sort method that determines whether items a and b swap places
 * @param {Boolean} [preventDefault=false] - If true then the Change event is not fired
 * @returns {Object[]} items - The new array of Observable Items
 */
  sort (sortMethod = (a, b) => {
    return b - a
  }, preventDefault = false) {
    const was = this._arrayState()
    this._values = this._values.sort(sortMethod)
    const isNow = this._arrayState()
    if (was !== isNow && !preventDefault) this._changed()
    return this._values
  }
}

export default ARRAY
