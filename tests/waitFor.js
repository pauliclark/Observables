
const waitFor = check => {
  return new Promise((resolve, reject) => {
    const timedCheck = () => {
      setTimeout(() => {
        if (check()) return resolve()
        timedCheck()
      }, 20)
    }
    timedCheck()
  })
}
export default waitFor
