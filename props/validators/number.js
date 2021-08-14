import messages from './errorMessages'
const numbers = {
  required:({message} = {}) => {
    message = message ||  messages.isRequired
    return (str) => {
      return !!str ? '' : message
    }
  }
}
export default numbers