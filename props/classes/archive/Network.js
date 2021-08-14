/* eslint-disable react/style-prop-object */
/* eslint-disable react/react-in-jsx-scope */
import { $ } from 'venuescanner-js/tools/elemental'
// import { templates } from 'venuescanner-js/tools/dot/templates'

import { client } from 'venuescanner-js/services/socketClient'
import { User } from './User'
import { popup } from 'venuescanner-js/vanilla/components/popup'
import { NetworkSchema } from 'venuescanner-js/schemas/network'
import { Observable } from './Observable'
import { ObservableArray } from './ObservableArray'
import { ModelStore } from './ModelStore'
import { ErrorDisplay } from '../components/error'
// import { permissions, networkPermissions, venuePermissions } from 'venuescanner-js/constants/role_permissions'
// import { notifications, notificationsEmail, notificationsSMS } from 'venuescanner-js/constants/role_notifications'
// import { auth } from 'venuescanner-js/vanilla/components/auth'
// import { className } from 'postcss-selector-parser'
import { confirm } from 'venuescanner-js/vanilla/components/confirm'
import { InviteUser } from './components/invite-user'
// import { EllipsisOptions } from './components/ellipsis-options'
import { node, domRenderer } from 'venuescanner-js/tools/jsx'
// import { VenueButtons } from './components/venue'
import { Role } from './Role'
import { Venue } from './Venue'
import { AccessibleStatuses } from 'venuescanner-js/constants/venue'
const onlyStatuses = Object.values(AccessibleStatuses)
const venueIsAvailable = venue => {
  return onlyStatuses.includes(venue.status.valueOf())
}
// const ActiveVenueStatuses = require('venuescanner-js/constants/active_venue_status')
class Network extends Observable {
  constructor (props) {
    super({ schema: NetworkSchema, props })
    // console.log({ [this._id.toString()]: auth.hasPermission('networkPermissions', { network: this }) })
  }
  modelType = 'Network'
  container = null
  table = null
  buttons = {
    manage: null,
    edit: null,
    addUser: null
  }
  triggers = {}
  users () {
    // trigger update to the available users
    // console.log('Triggered users in ', this)
    if (this.triggers.users) {
      for (let t = this.triggers.users.length - 1; t >= 0; t--) {
        try {
          this.triggers.users[t]()
        } catch (e) {
          console.error(e)
          this.triggers.users.splice(t, 1)
        }
      }
    }
  }
  listenTrigger (t = 'users', method) {
    if (!this.triggers[t]) this.triggers[t] = []
    this.triggers[t].push(method)
  }
  manage (arena) {
    this.buttons.manage.loading = true
    try {
      this.fetchUsers(arena)
    } catch (e) {
      console.error(e)
    }
  }
  _venues= new ObservableArray(null, {
    schema: Venue
  })
  processVenueForArray (venue) {
    if (venueIsAvailable(venue)) this._venues.push(venue)
    this._venues.sort((a, b) => {
      if (a.name < b.name) return -1
      if (a.name > b.name) return 1
      return 0
    })
    venue.status.watch(() => {
      const include = venueIsAvailable(venue)
      const inArray = this._venues.find(v => v === venue)
      if (include && !inArray) {
        this._venues.push(venue)
      } else if (!include && inArray) {
        this._venues.remove(venue)
      }
    })
  }
  getVenues (accessibleBy) {
    if (this._venues.length === 0) {
      ModelStore.filter('Venue', r => r.networkRef === this || r.networkRef === null).forEach(venue => {
        this.processVenueForArray(venue)
      })
      ModelStore.listenForBuilds('Venue', (venue) => {
        this.processVenueForArray(venue)
      }, venue => {
        return venue.networkRef === this || venue.networkRef === null
      })
    }
    return this._venues
  }
  _roles= new ObservableArray(null, {
    schema: Role
  })
  getRoles () {
    if (this._roles.length === 0) {
      ModelStore.filter('Role', r => r.networkRef === this || r.networkRef === null).forEach(r => {
        this._roles.push(r)
      })
      ModelStore.listenForBuilds('Role', (role) => {
        this._roles.push(role)
      }, role => {
        return role.networkRef === this || role.networkRef === null
      })
    }
    return this._roles
  }
  _users= new ObservableArray(null, {
    schema: User
  })
  async getUsers () {
    // console.log('getUsers')
    if (!this.loaded.users) {
      await this.loadUsers()
      // setTimeout(() => { this.loadUsers() }, 500)

      ModelStore.filter('User', u => {
        return u.network.includes(this) || u.pending_invite.includes(this)
      }).forEach(user => {
        this._users.push(user)
        user.watch(() => {
          if (!(u.network.includes(this) || u.pending_invite.includes(this))) {
            this._users.remove(user)
          } else {
            if (!this._users.includes(user)) this._users.push(user)
          }
        })
      })
      ModelStore.listenForBuilds('User', (user) => {
        // console.log(user.network, this, user.network.includes(this))
        this._users.push(user)
        user.watch(() => {
          if (!(user.network.includes(this) || user.pending_invite.includes(this))) {
            this._users.remove(user)
          } else {
            if (!this._users.includes(user)) this._users.push(user)
          }
        })
      }, u => {
        return u.network.includes(this) || u.pending_invite.includes(this)
      })
    }
    return this._users
  }
  getNetworkRoles (systemRole = true) {
    let roles = this.getRoles()
    if (systemRole) roles = roles.filter(r => !r.networkRef)
    return roles.filter(r => r.isNetworkRole())
  }
  getVenueRoles (systemRole = true) {
    let roles = this.getRoles()
    if (systemRole) roles = roles.filter(r => !r.networkRef)
    return roles.filter(r => !r.isNetworkRole())
  }
  deleteUser (user, completed = () => { }) {
    confirm(`Are you sure you wish to remove ${user.name} from Group ${this.name}?`, async () => {
      const response = await client.sendPromise('room', { deleteUser: { network: this._id, user: user._id.valueOf() } })
      if (response.deleted) {
        ErrorDisplay.info(`${user.name} has been removed from Group ${this.name}`)
        completed()
      }
    }, () => {

    })
  }
  inviteUser () {
    const button = $(`<vs-btn type='primary'>Invite</vs-btn>`).get(0)
    button.disabled = true
    const input = (<InviteUser
      network={this}
      venues={this.getVenues()}
      roles={this.getVenueRoles()}
      inviteMethod={async ({ email, failed, venues, role }) => {
        const response = await client.sendPromise('room', { inviteUsers: { network: this._id, email, venues, role } })
        if (response.invitation) {
          ErrorDisplay.info(`Invitation sent to ${email}`)
          popup.close()
        } else {
          failed()
        }
      }}
    ></InviteUser>).render(domRenderer)
    const container = $('<div></div>').append(
      input
    ).css({
      margin: '10px 0',
      display: 'block'
    })
    popup.new(container, { closable: true, notBackground: true })
  }
  async renderRequests () {
    const me = await this.me()
    // console.log({ me })
    if (!me) return false
    const venues = this.getVenues(me)
    // console.log(venues)
    const requestedVenues = venues.sort((a, b) => {
      return a.access_request > b.access_request
    })
    // console.log(requestedVenues)
    return requestedVenues.map(venue => venue.renderRequests())
  }
  loaded = {
    users: false
  }
  async loadRequestUsers () {
    if (this.loaded.users) return
    const response = await client.sendPromise('room', { getUsers: { network: this._id } })
    const { User } = ModelStore.build({ User: response.users })
    // console.log({User})
    this.loaded.users = true
  }
  async loadUsers () {
    if (this.loaded.users) return
    const response = await client.sendPromise('room', { getUsers: { network: this._id } })
    const { User } = ModelStore.build({ User: response.users })
    // console.log({User})
    this.loaded.users = true
  }
  async fetchUsers (arena) {
    await this.loadUsers()
    arena.empty().append(await this.renderAccess())
    this.buttons.manage.loading = false
    this.buttons.manage.disabled = true
    this.buttons.manage.edit = false
  }
  async edit () {
    const container = $('<div></div>').append(
      $('<label></label>').html('Group name').append(
        this.name.input()
      ).css({
        margin: '10px 0',
        display: 'block'
      })
    )
    popup.new(container, { closable: true })
  }
  async cancelInvite (user, success, failure) {
    confirm(`You sure you wish to cancel the invite to ${user.name}?`, async () => {
      const response = await client.sendPromise('room', { cancelInvite: { user: user._id, network: this._id } })
      if (response.invite) {
        success()
      } else {
        failure()
      }
    }, () => {
      failure()
    })
  }
  async me () {
    const users = await this.getUsers()
    // console.log({ users })
    return users.find(u => {
      return u._id.valueOf() === window.data.user._id
    })
  }
  countedNetworkRoles = null
  async getNetworkRoleUserCount () {
    if (this.countedNetworkRoles === null) {
      return this.networkRoleUserCount()
    } else {
      return this.countedNetworkRoles
    }
  }
  async networkRoleUserCount () {
    const users = await this.getUsers()
    // console.log(users)
    const systemRole = true
    const networkRoles = this.getNetworkRoles(systemRole)
    // console.log(networkRoles)
    const role = networkRoles[0]
    const networkUsers = users.filter(user => {
      return user.hasNetworkRole(this, role)
    })
    // console.log({ users, networkRoles, networkUsers })
    this.countedNetworkRoles = networkUsers.length
    return this.countedNetworkRoles
  }
  networkRolesListeners = []
  watchNetworkRoles (cb) {
    this.networkRolesListeners.push(cb)
  }
  async triggerNetworkRoles () {
    const networkRoleUserCount = await this.networkRoleUserCount()
    for (let t = this.networkRolesListeners.length - 1; t >= 0; t--) {
      try {
        this.networkRolesListeners[t](networkRoleUserCount === 1)
      } catch (e) {
        this.networkRolesListeners.splice(t, 1)
      }
    }
  }
}

export { Network }
