/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
// import { $ } from 'venuescanner-js/tools/elemental'
// import { templates } from 'venuescanner-js/tools/dot/templates'
// import { getToApi, postToApi } from 'venuescanner-js/services/api'
// import { objectListener } from 'venuescanner-js/utils/objectParamListener'
// import { client } from 'venuescanner-js/services/socketClient'
import { Observable } from 'venuescanner-js/vanilla/models/Observable'
// import { ObservableArray } from 'venuescanner-js/vanilla/models/ObservableArray'
import { SpaceSchema } from 'venuescanner-js/schemas/network'
import { DECIMAL } from 'venuescanner-js/vanilla/models/ObservablePropTypes'
// eslint-disable-next-line no-unused-vars
import { node } from 'venuescanner-js/tools/jsx'
class Space extends Observable {
  constructor (props) {
    super({ schema: SpaceSchema, props })
    this.completion()
  }
  modelType = 'Space'
  complete = new DECIMAL(null, 0)
  completionScore () {
    let score = 0
    if (this.name.valueOf().length > 0) {
      score += 1
    }
    return score
  }
  completion () {
    this.watch(() => {
      this.complete.set(this.completionScore())
    })
    this.complete.set(this.completionScore())
  }
}

export { Space }
