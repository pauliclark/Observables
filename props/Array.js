
import PropEvents from './classes/PropEvents.js'
import props, { typesFoundInSchema } from './index.js'
import { CHANGE } from './classes/events.js'
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
class ARRAY extends PropEvents {
  constructor (sourceSchema = null, { values, parent, name } = {}) {
    super(parent)
    this.values = []
    this.schema = null
    if (sourceSchema) {
      const [[schema], schemaValues] = schemaBuilder(sourceSchema)
      // console.log(schema)
      this.schema = schema
      // append schemaValues
      this._assign(schemaValues || values)
    }
    if (parent && name) {
      parent[name] = this
      this.name = name
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

  [Symbol.iterator] () { return makeIterator(this.values) }

  _itemProp () {
    if (typesFoundInSchema.includes(this.schema)) {
      return this.schema
    } else if (this.schema instanceof Array) {
      return ARRAY
    } else {
      return OBJECT
    }
  }

  _assign (values) {
    const Prop = this.schema ? this._itemProp() : null
    if (!(values instanceof Array)) values = [values]
    this.values = values.map(val => {
      if (Prop) {
        if (typesFoundInSchema.includes(this.schema)) {
          return new Prop(val, { parent: this })
        } else if (Prop === ARRAY) {
          return new ARRAY(this.schema[0], { parent: this, values: val })
        } else if (Prop === OBJECT) {
          return new OBJECT(this.schema, { parent: this, values: val })
        }
      }
      return null
    }).filter(v => v)
  }

  newItem (props) {
    if (this.schema) {
      const Prop = this._itemProp()
      if (typesFoundInSchema.includes(this.schema)) {
        return new Prop(props, { parent: this })
      } else if (Prop === ARRAY) {
        return new ARRAY(this.schema[0], { parent: this, values: props })
      } else if (Prop === OBJECT) {
        return new OBJECT(this.schema, { parent: this, values: props })
      }
    }
  }

  changed () {
    this[CHANGE]()
  }

  push (props, preventDefault = false) {
    this.values.push(this.newItem(props))
    if (!preventDefault) this.changed()
  }

  shift (preventDefault = false) {
    const r = this.values.shift()
    if (!preventDefault) this.changed()
    return r
  }

  pop (preventDefault = false) {
    const r = this.values.pop()
    if (!preventDefault) this.changed()
    return r
  }

  splice (idx, remove, props, preventDefault = false) {
    if (!(props instanceof Array)) props = [props]
    const r = this.values.splice(idx, remove, props.map(prop => this.newItem(prop)))
    if (!preventDefault) this.changed()
    return r
  }

  slice (a, b, preventDefault = false) {
    const r = this.values.slice(a, b)
    if (!preventDefault) this.changed()
    return r
  }

  remove (items) {
    if (!(typeof items instanceof Array)) items = [items]
    let success = false
    const vals = this.values
    for (let v = vals.length - 1; v >= 0; v--) {
      if (items.includes(vals[v])) {
        this.values.splice(v, 1)
        vals.splice(v, 1)
        success = true
      }
    }
    if (success) this.changed()
    return success
  }

  // valuesRef () {
  //   return this.values.map(v => {
  //     return v.getRef ? v.getRef() : v
  //   })
  // }

  filter (method) {
    if (!(method instanceof Function)) return this.values
    return this.values.filter(method)
  }

  find (method) {
    if (!(method instanceof Function)) return this.values
    return this.values.find(method)
  }

  moveItem ({ from, to }) {
    if (from < to) {
      to--
    }
    this.values.splice(to, 0, this.values.splice(from, 1)[0])
    this.changed()
  }

  indexOf (item) {
    return this.values.indexOf(item)
  }

  map (method) {
    return this.values.map(method)
  }

  forEach (method) {
    return this.values.forEach(method)
  }

  reverse () {
    this.values = this.values.reverse()
    this.changed()
    return this.values
  }

  includes (value) {
    const toCheck = (value && value.get ? value.get() : (value.valueOf ? value.valueOf() : value))
    return !!this.values.find(val => {
      return (val && val.get ? val.get() : (val && val.valueOf ? val.valueOf() : val)) === toCheck
    })
  }

  get (idx = null) {
    return idx === null
      ? this.values
      : (
          idx >= this.values.length ? null : this.values[idx]
        )
  }

  set (props = [], preventDefault = false) {
    // console.log(props, this.getKey())
    if (!(props instanceof Array)) {
      // console.log({props})
      throw new Error('Expected Array in props')
    }
    // const Schema = this.Schema
    // console.log({props})
    this.values = props.map(p => {
      // if (typeof Schema === 'function' && p instanceof Schema ) return p
      return this.newItem(p)
    })
    // if (!this.Schema) console.log(this.values)
    // console.log(this)
    if (!preventDefault) this.changed()
    return this.values
  }

  arrayState () {
    return JSON.stringify(this.values.sort((a, b) => {
      if (a._id) {
        return a._id - b._id
      } else {
        return a - b
      }
    }))
  }

  update (props, preventDefault = false) {
    if (!(props instanceof Array)) throw new Error('Expected Array in props')
    const currentLength = this.values.length
    // const currentState = this.arrayState()
    const foundItems = []
    let idx = 0
    const list = []
    let isReordered = false

    while (props.length > 0) {
      const data = props.shift()
      let foundItem = this.values.find(v => {
        return v.equals(data)
      })
      if (data._id && !foundItem) {
        foundItem = this.values.find(v => {
          // console.log(v._id.valueOf())
          return (!v._id || !v._id.valueOf()) && (!foundItems.includes(v))
        })
      }
      if (foundItem) {
        foundItems.push(foundItem)
        foundItem.update(data, preventDefault)
        if (this.values.indexOf(foundItem) !== idx) isReordered = true
      } else {
        const newItem = this.newItem(data)
        foundItems.push(newItem)
        // this.values.push(newItem)
      }
      // } else {

      // }
      idx++
    }
    // console.log(this.getKey())
    // console.log(JSON.parse(JSON.stringify(foundItems)))
    this.values = foundItems
    // for (let l = this.values.length - 1; l >= 0; l--) {
    //   if (!foundItems.includes(this.values[l])) this.values.splice(l, 1)
    // }

    // const newState = this.arrayState()
    // if (this.getKey() === 'pending_invite') {
    // console.log(props)
    // }
    const newLength = this.values.length
    // console.log(currentLength , newLength)
    if (!preventDefault && (isReordered || currentLength !== newLength)) this.changed(true)
    // if (!preventDefault && currentState !== newState) this.changed(true)
    return this.values
  }

  getLength () {
    return this.values.length
  }

  valueOf () {
    return this.values.map(r => r.valueOf ? r.valueOf() : r)
  }

  toJSON () {
    return this.values
  }

  toObject () {
    return this.values.map(r => r.toObject ? r.toObject() : r)
  }

  sort (func = (a, b) => {
    return b - a
  }) {
    this.values = this.values.sort(func)
    return this.values
  }
}

export default ARRAY
