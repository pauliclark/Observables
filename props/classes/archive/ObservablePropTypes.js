
import DATE from './ObservablePropTypeClasses/Date'
import BOOLEAN from './ObservablePropTypeClasses/Boolean'
import DECIMAL from './ObservablePropTypeClasses/Decimal'
import INTEGER from './ObservablePropTypeClasses/Integer'
import REFERENCE from './ObservablePropTypeClasses/Reference'
import STRING from './ObservablePropTypeClasses/String'
import TEXT from './ObservablePropTypeClasses/Text'


const types = {
  string: STRING,
  text: TEXT,
  date: DATE,
  integer: INTEGER,
  decimal: DECIMAL,
  boolean: BOOLEAN
  // array: ObservableArray,
  // object: ObservableObject
}
// const classesWithOptions = {}
const getClassWithOptions = (parentClass, options = {}) => {
  // create extending class for type for options to be available
  return class extends parentClass{
    constructor(parent, value) {
      super(parent, value, options)
    }
  }
}

const nativeObjects = [String,Number,Boolean, Date]

const transposePropType = function (obj) {

  
  Object.keys(obj).forEach(k => {
    const options = obj[k].frontend && obj[k].frontend.options ? {...obj[k].frontend.options} : null
    if (obj[k].frontend) {
      delete obj[k].frontend.options
      obj[k] = obj[k].frontend
    }
    // discover option for the param type
    if (obj[k].schema) {
      obj[k] = transposePropType(obj[k].schema)
    }else{
    if (obj[k].type) obj[k] = obj[k].type
    if (types[obj[k]]) {
      obj[k] = options ? getClassWithOptions(types[obj[k]],options) : types[obj[k]]
    }else if (obj[k].type && types[obj[k].type]) {
      obj[k] = options ? getClassWithOptions(types[obj[k].type],options) : types[obj[k].type]
      if (obj[k].schema) obj[k].schema=transposePropType(obj[k].schema)
    } else if (obj[k] instanceof Array) {
      obj[k] = obj[k].map(o => {
        if (o.type && types[o.type]) {
          return options ? getClassWithOptions(types[o.type],options) : types[o.type]
        }else if (nativeObjects.includes(o)) {
          switch(o) {
            case Date:
              o = DATE
              break;
            case Boolean:
              o = BOOLEAN
              break;
            case Number:
              o = DECIMAL
              break;
            default:
              o = STRING
              break;
          }
          if (options) o = getClassWithOptions(o,options)
        } else {
          return transposePropType(o)
        }
      })
    }else if (nativeObjects.includes(obj[k])) {
      switch(obj[k]) {
        case Date:
          obj[k] = DATE
          break;
        case Boolean:
          obj[k] = BOOLEAN
          break;
        case Number:
          obj[k] = DECIMAL
          break;
        default:
          obj[k] = STRING
          break;
      }
      if (options) obj[k] = getClassWithOptions(obj[k],options)
    } else if (obj[k] instanceof Object) {
      obj[k] = transposePropType(obj[k])
    }
  }
    // if (options) console.log(obj[k])
    // if (k === 'from')  console.log(obj[k])
  })
  return obj
}
export {
  STRING,
  TEXT,
  DATE,
  INTEGER,
  DECIMAL,
  BOOLEAN,
  REFERENCE,
  transposePropType
}
