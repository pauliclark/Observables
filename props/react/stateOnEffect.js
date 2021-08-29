import { CHANGE } from '../events/events.js'

const stateOnEffect = (observable = {}, { useState, useEffect }) => {
  if (!observable.isObservable) throw new Error('Provided Object is not observable')
  const [value, setValue] = useState(observable.toJSON())
  // console.log(value)
  useEffect(() => {
    // console.log({ watcher: observable.toJSON() })
    const watcher = () => {
      setValue(observable.toJSON())
    }

    observable.on(CHANGE, watcher)
    return () => {
      observable.off(CHANGE, watcher)
    }
  })
  return value
}

export default stateOnEffect
