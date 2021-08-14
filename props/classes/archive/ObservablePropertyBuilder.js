// import { ObservableProps } from './ObservableProps'
import { ObservableArray } from './ObservableArray'
import { ObservableObject } from './ObservableObject'
// import { ModelStore } from './ModelStore'

const buildProperties = (object, schema) => {
  // console.log({ object, schema })
  object.schema = schema
  for (let [k, Value] of Object.entries(schema)) {
    // console.log({ k, Value })
    if (!(Value instanceof Array) && typeof (Value) !== 'object') {
      // console.log(value.constructor.name)
      try {
        object.data[k] = new Value(object, null)
      } catch (e) {
        console.error(e)
        console.error(e.message.replace(/Value/, Value))
      }
    } else if (Value instanceof Array && Value.length) {
      object.data[k] = new ObservableArray(object, { schema: Value[0] })
    } else {
      // console.log({Value})
      object.data[k] = new ObservableObject(object, { schema: Value.schema || Value })
    }
    if (object.data[k].getRef) {
      Object.defineProperty(object, `${k}Ref`, {
        get: () => {
          // if (object.data[k] && object.data[k].getRef) return object.data[k].getRef()
          return object.data[k].getRef()
        }
      })
    }
    Object.defineProperty(object, k, {
      get: () => {
        // if (object.data[k] && object.data[k].getRef) return object.data[k].getRef()
        return object.data[k]
      },
      set: (v) => {
        v = v && v.valueOf ? v.valueOf() : v
        let currentValue = object.data && object.data[k]
        currentValue = currentValue && currentValue.valueOf ? currentValue.valueOf() : currentValue
        if (currentValue !== v) {
          // console.log({ v: v })
          object.data[k].set(v)
          // if (!object.modified.includes(k)) object.modified.push(k)
          // object.data[k] = v
          // object.triggerListeners(k)
        }
      }
    })
  }

  // keys.forEach(k => {
  //   // eslint-disable-next-line compat/compat
  //   if (Object.values(ObservableProps).includes(object.schema[k])) {
  //     Object.defineProperty(object, k, {
  //       get: () => {
  //         return object.data[k]
  //       },
  //       set: (v) => {
  //         // console.log(k, v)
  //         if (object.data && object.data[k] !== v) {
  //           if (!object.modified.includes(k)) object.modified.push(k)
  //           object.data[k] = v
  //           object.triggerListeners(k)
  //         }
  //       }
  //     })
  //   } else if (object.schema[k] instanceof Array && object.schema[k].length) {
  //     object.data[k] = new ObservableArray({ schema: object.schema[k][0] })
  //   } else {
  //     object.data[k] = new ObservableObject({ schema: object.schema[k] })
  //   }
  // })
}
const assignProperties = (object, props = {}, preventEvent = false) => {
  if (!object) throw new Error('Cannot assign properties - target object is missing')
  // if (props.role) throw new Error("Test")
  // if (!preventEvent) console.log({ props })
  if (props instanceof Object) {
    const keys = Object.keys(props)
    keys.forEach(k => {
      if (object.data[k] && object.data[k].set) {
        object.data[k].set(props[k], preventEvent)
      } else {
        // console.error(`Not setting ${k}`)
        // object.data[k] = props[k]
      }
    })
  } else if (props instanceof Array) {
    object.set(props, preventEvent)
  }
}
const updateProperties = async (object, props = {}, preventEvent = false) => {
  if (!object) throw new Error('Cannot assign properties - target object is missing')
  // console.log({ props })
  if (props instanceof Object) {
    const keys = Object.keys(props)
    await Promise.all(
      keys.map(k => {
        if (object.data[k] && object.data[k].update) {
          return object.data[k].update(props[k], preventEvent)
        }
      })
    )
    // keys.forEach(k => {
    //   if (object.data[k] && object.data[k].update) {
    //     await object.data[k].update(props[k], preventEvent)
    //   } else {
    //     // object.data[k] = props[k]
    //   }
    // })
  } else if (props instanceof Array) {
    await object.update(props, preventEvent)
  }
}

export { buildProperties, assignProperties, updateProperties }
