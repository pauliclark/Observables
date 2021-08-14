import { phoneRegex, emailRegex, redactRegex, urlRegex } from 'venuescanner-js/utils/regexes'
import messages from './errorMessages'
const emails = {
  valid: ({ message } = {}) => {
    message = message || messages.invalidEmail
    return (str) => {
      return !!str && str.match(emailRegex) ? '' : message
    }
  }
}

export default emails
