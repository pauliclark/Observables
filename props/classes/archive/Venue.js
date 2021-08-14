/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import { $ } from 'venuescanner-js/tools/elemental'
// import { templates } from 'venuescanner-js/tools/dot/templates'
// import { getToApi, postToApi } from 'venuescanner-js/services/api'
// import { objectListener } from 'venuescanner-js/utils/objectParamListener'
import { client } from 'venuescanner-js/services/socketClient'
import { Observable } from 'venuescanner-js/vanilla/models/Observable'
import { ObservableArray } from 'venuescanner-js/vanilla/models/ObservableArray'
import { VenueSchema } from 'venuescanner-js/schemas/network'
import { BOOLEAN, DECIMAL } from 'venuescanner-js/vanilla/models/ObservablePropTypes'
// import { SPACE } from 'venuescanner-js/vanilla/models/ObservablePropTypesCustom'
import { Space } from 'venuescanner-js/vanilla/models/Space'
import { node, domRenderer } from 'venuescanner-js/tools/jsx'
import { AccessibleStatuses } from 'venuescanner-js/constants/space'
const ActiveVenueStatuses = require('venuescanner-js/constants/active_venue_status')
const onlyStatuses = Object.values(AccessibleStatuses)
const spaceIsAvailable = space => {
  return onlyStatuses.includes(space.status.valueOf())
}
const UnderReviewVenueStatuses = require('venuescanner-js/constants/under_review_venue_status')
const AccessRequestRoleButtons = ({ user, venue, network }) => {
  const roles = network.getRoles().filter(r => {
    return !r.isNetworkRole() && !user.hasVenueRole(venue, r)
  })
  const buttons =
    roles.map(role => {
      return (<vs-btn type="primary" onClick={
        async function (e) {
          buttons.forEach(but => {
            but.disabled = true
          })
          this.loading = true
          user.toggleRole(role, venue, null, true)
          await venue.removeAccessRequest(user)
          const { notify } = await client.sendPromise('room', {
            acceptedRequestSendEmail: {
              venue: venue._id,
              requestor: user._id,
              network: this._id
            }
          })
        }
      }>{role.name}</vs-btn>)
    })
  return (
    <div>Assign role: {buttons} <vs-btn type="asLink" onClick={
      async function () {
        buttons.forEach(but => {
          but.disabled = true
        })
        this.loading = true
        await venue.removeAccessRequest(user)

        const { notify } = await client.sendPromise('room', {
          declinedRequestSendEmail: {
            venue: venue._id,
            requestor: user._id,
            network: this._id
          }
        })
      }}>decline request</vs-btn></div>
  )
}
const AccessRequest = ({ user = {}, venue, network }) => {
  // console.log({ user, venue, network })
  return (
    <div>
      {user.name} {user.lastName} ({user.email}) has requested access to this venue<div><p>
        <AccessRequestRoleButtons
          user={user}
          venue={venue}
          network={network}
        ></AccessRequestRoleButtons></p>
      </div></div>
  )
}
class Venue extends Observable {
  constructor (props) {
    super({ schema: VenueSchema, props })
    this.published.set(this.isActive())
    this.underReview.set(this.isUnderReview())
    this.status.watch(() => {
      this.published.set(this.isActive())
      this.underReview.set(this.isUnderReview())
    })
    this.completion()
  }
  modelType = 'Venue'
  published = new BOOLEAN()
  underReview = new BOOLEAN()
  complete = new DECIMAL(null, 0)
  isActive () {
    // console.log(ActiveVenueStatuses)
    return Object.values(ActiveVenueStatuses).includes(this.status.valueOf())
  }
  isUnderReview () {
    // console.log(UnderReviewVenueStatuses)
    return Object.values(UnderReviewVenueStatuses).includes(this.status.valueOf())
  }
  removeAccessRequest (user) {
    this.access_request = this.access_request.filter(ar => {
      return ar !== user
    })
  }
  completionScore (spaces) {
    let score = 0
    // console.log({spaces:spaces.length})
    if (spaces.length) {
      const spaceScores = spaces.map(space => space.complete.valueOf())
      let total = 0
      spaceScores.forEach(score => {
        total += score
      })
      total /= spaceScores.length
      score += total
    }
    return score
  }
  completion () {
    const spaces = this.getSpaces()
    spaces.watch(() => {
      this.complete.set(this.completionScore(spaces))
    })
    this.watch(() => {
      this.complete.set(this.completionScore(spaces))
    })
    this.complete.set(this.completionScore(spaces))
  }
  renderRequests () {
    const container = $('<div>')
    const drawRequests = () => {
      container.empty().append(
        (<div><h3>
          Venue: {this.name}
        </h3>
        {
          this.access_request.length ? this.access_request.map(user => {
            return (
              <AccessRequest
                user={user}
                venue={this}
                network={this.network}
              >
              </AccessRequest >
            )
          }) : (<p>No pending access requests for this venue</p>)
        }
        </div>).render(domRenderer)
      )
      this.access_request.watch(() => {
        drawRequests()
      }, false, true)
    }
    container.append(drawRequests())
    return container
  }
  processSpaceForArray (space) {
    const inArray = this._spaces.find(v => v === space)
    if (spaceIsAvailable(space) && !inArray) this._spaces.push(space)
    // console.log(space, spaceIsAvailable(space))
    space.status.watch(() => {
      const include = spaceIsAvailable(space)
      const inArray = this._spaces.find(v => v === space)
      // console.log(space, include, this._spaces)
      if (include && !inArray) {
        this._spaces.push(space)
      } else if (!include && inArray) {
        this._spaces.remove(space)
      }
    })
  }
  _spacesSet = false
  _spaces = new ObservableArray(null, { schema: Space })

  getSpaces () {
    if (this._spaces.length === 0) {
      ModelStore.filter('Space', r => r.venueRef === this).forEach(r => {
        this.processSpaceForArray(r)
      })
      ModelStore.listenForBuilds('Space', (space) => {
        this.processSpaceForArray(space)
      }, space => {
        return space.venueRef === this
      })
    }
    return this._spaces
  }
  spaceList () {
    // console.log({_spaces:this._spaces})
    return this._spaces
  }
  setSpaceList (spaces) {
    // console.log({setSpaceList:spaces})
    spaces.forEach(space => {
      this.processSpaceForArray(space)
    })
    // console.log({_spaces:this._spaces})
    this._spacesSet = true
    return this._spaces
  }
}

export { Venue }
