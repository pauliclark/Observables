import { ObservableObject } from './ObservableObject'
import { STRING, BOOLEAN } from './ObservablePropTypes'
const ObservableValidation = (toMonitor, validationSchema = {}) => {
  const keys = Object.keys(toMonitor.data)
  const schema = {
    _valid: BOOLEAN,
    _invalid: BOOLEAN
  }
  keys.forEach(key => {
    if (validationSchema[key]) schema[key] = STRING
  })
  const validation = new ObservableObject(null, { schema })
  keys.forEach(key => {
    if (validationSchema[key]) {
      const checkValid = () => {
        let isValid = true
        keys.forEach(key => {
          if (validationSchema[key]) {
            if (validation[key].valueOf()) isValid = false
          }
        })
        // console.log({isValid})
        validation._valid.set(isValid)
        validation._invalid.set(!isValid)
      }
      const checker = val => {
        const checks = validationSchema[key] instanceof Array ? validationSchema[key] : [validationSchema[key]]
        const msg = checks.map(check => check(val)).filter(e => !!e).shift()
        // console.log(msg)
        validation[key].set(msg || '')
      }
      toMonitor[key].watch(checker)
      validation[key].watch(val => {
        checkValid()
      })
      checker(toMonitor[key].valueOf())
    }
  })
  return validation
}
export { ObservableValidation }
