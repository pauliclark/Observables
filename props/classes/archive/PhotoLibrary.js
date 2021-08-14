import { Observable } from 'venuescanner-js/vanilla/models/Observable'
import { PhotoLibrarySchema } from 'venuescanner-js/schemas/network'

class PhotoLibrary extends Observable {
  constructor (props) {
    super({ schema: PhotoLibrarySchema, props })
  }
  modelType = 'PhotoLibrary'
}

export { PhotoLibrary }
