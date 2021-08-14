import messages from './errorMessages'
const strings = {
  required:({message} = {}) => {
    message = message ||  messages.isRequired
    return (str) => {
      return !!str ? '' : message
    }
  }
}
export default strings