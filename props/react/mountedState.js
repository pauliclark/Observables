import { CHANGE } from '../classes/events.js'
const mountedState = (observable, componentClass) => {
  if (!observable.isObservable) throw new Error('Provided Object is not observable')
  const initialState = {}
  componentClass.state = initialState
  const watcher = () => {
    componentClass.setState(observable._value)
  }
  const mount = () => {
    observable.on(CHANGE, watcher)
  }
  const unmount = () => {
    observable.off(CHANGE, watcher)
  }
  return { mount, unmount }
}

export default mountedState
