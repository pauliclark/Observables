/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable babel/no-unused-expressions */
import { NODE_TYPE } from 'jsx-pragmatic'
import { Observable } from 'venuescanner-js/vanilla/models/Observable'
import { UserSchema } from 'venuescanner-js/schemas/network'
// import { ModelStore } from 'venuescanner-js/vanilla/models'
import { $ } from 'venuescanner-js/tools/elemental'
import { authService } from 'venuescanner-js/vanilla/components/auth'
import { client } from 'venuescanner-js/services/socketClient'
import { node, domRenderer } from 'venuescanner-js/tools/jsx'
class User extends Observable {
  constructor (props) {
    // console.log(props)
    super({ schema: UserSchema, props })
  }

  modelType = 'User'
  isMe () {
    return authService.user._id === this._id.valueOf()
  }
  hasVenueRole (venue, role = null) {
    const roles = this.venueRole.find(r => {
      // console.log(r.venue, venue)
      return (r.venueRef === venue) &&
        (role === null || r.role === role)
    })
    return !!roles
  }
  hasNetworkRole (network, role = null) {
    // console.log(network.getRef())
    const roles = this.networkRole.find(r => {
      return (r.networkRef === (network.ref || network)) &&
        (role === null || r.roleRef === role)
    })
    return !!roles
  }
  venueRoleCheckBox ({ role, venue, network }) {
    // console.log('venueRoleCheckBox')
    const canNetwork = authService.hasPermission('networkPermissions', { network: network._id })
    const canVenue = canNetwork || authService.hasPermission('addUser', { network: network._id }) || authService.hasPermission('venuePermissions', { venue: venue._id })
    const editable = (role.isNetworkRole() && canNetwork) || (!role.isNetworkRole() && canVenue)
    const chk = editable ? $(`<vs-chk name="${venue._id}_${this._id}_${role._id}">`) : $('<span></span')
    const setChecked = (ignoreVisible = false) => {
      if (!ignoreVisible && !chk.get(0).offsetParent) {
        throw new Error('Checkbox no longer visible')
      }
      // console.log({networkRole:this.networkRole,role, venue, network})
      if (editable) {
        chk.get(0).checked = this.hasRole(role, venue, network)
      } else {
        chk.empty().append(this.hasRole(role, venue, network) ? $('<vs-tick></vs-tick>') : $('<vs-cross></vs-cross>'))
      }
    }
    if (editable) {
      chk.bind('vschange', (e) => {
        // console.log({ role, venue, network, val: e.detail })
        this.toggleRole(role, venue, network, e.detail)
        network.triggerNetworkRoles()
      })
    }
    if (role.isNetworkRole()) {
      this.networkRole.watch(() => {
        setChecked()
      }, false)
    } else {
      this.venueRole.watch(() => {
        setChecked()
      }, false)
    }

    setChecked(true)
    if (editable) {
      const asyncWork = async () => {
        if (role.isNetworkRole() && !!network) {
          const chkElement = chk.get(0)
          const cannotUnset = await network.getNetworkRoleUserCount() === 1
          // console.log({ cannotUnset })
          const isChecked = this.hasRole(role, venue, network)
          // console.log({ cannotUnset })
          if (isChecked && cannotUnset) chkElement.disabled = cannotUnset
          // console.log('Watching other network roles', this)
          network.watchNetworkRoles((cannotUnset) => {
            if (!chkElement.parentNode) {
              throw new Error('Checkbox has been removed')
            } else {
              // console.log('Checking role access', this)
              if (chkElement.checked) {
                chkElement.disabled = cannotUnset
              } else {
                chkElement.disabled = false
              }
            }
          })
        }
      }
      asyncWork()
    }
    return {
      type: NODE_TYPE.ELEMENT,
      dontObserve: true,
      render: () => {
        return chk.get(0)
      }
    }
  }
  hasRole (role, venue = null, network = null) {
    if (this.networkRole && network && role.isNetworkRole()) {
      const roleIds = this.networkRole.filter(r => r.networkRef === network).map(r => r.role.valueOf())
      return roleIds.includes(role._id.get())
    } else if (this.venueRole && venue && !role.isNetworkRole()) {
      const roleIds = this.venueRole.filter(r => r.venueRef === venue).map(r => r.role.valueOf())
      return roleIds.includes(role._id.get())
    } else {
      return false
    }
  }
  toggleRole (role, venue = null, network = null, on = null) {
    // console.log({ on })
    // console.log({ user: this, role, network, venue })
    if (network && role.isNetworkRole()) {
      const networkRoles = this.networkRole.filter(r => {
        // console.log({ network: r.networkRef, role: r.roleRef, match: r.networkRef === network && r.roleRef === role })
        return r.networkRef === network && r.roleRef === role
      })
      if (networkRoles.length && on !== true) {
        while (networkRoles.length) {
          const networkRole = networkRoles.shift()
          this.networkRole.remove(networkRole)
        }
      } else if (on !== false) {
        this.networkRole.push({
          network: network,
          role: role
        })
      }
      return true
    } else if (venue && !role.isNetworkRole()) {
      const venueRoles = this.venueRole.filter(r => {
        // if (r.roleRef === role) console.log({ role })
        // if (r.venueRef === venue) console.log({ venue })
        return r.venueRef === venue && r.roleRef === role
      })
      if (venueRoles.length && on !== true) {
        while (venueRoles.length) {
          const venueRole = venueRoles.shift()
          this.venueRole.remove(venueRole)
        }
      } else if (on !== false) {
        this.venueRole.push({
          venue: venue,
          role: role
        })
        venue.access_request.remove(this)
      }
      return true
    }
    return false
  }
  inNetwork (network) {
    return this.network.includes(network)
  }
  listenToRoleChanges (callback) {
    this.networkRole.watch(callback)
    this.venueRole.watch(callback)
  }
  renderInvites () {
    const container = $('<div></div>')
    const drawList = () => {
      container.empty()
      if (this.pending_invite.length) {
        container.append(
          this.pending_invite.map(network => {
            if (!network) return null
            let inviteMessage
            let acceptDecline
            let accept
            let decline
            return (<div class="invitation">
              <h3>{network.name}</h3>
              <h4 ref={el => { inviteMessage = el }}>You have been invited to join the {network.name} network</h4>
              <div ref={el => { acceptDecline = el }}>
                <vs-btn type="primary"
                  ref={el => { accept = el }}
                  onClick={async () => {
                    // join the network
                    accept.loading = true
                    const response = await client.sendPromise('room', { invitation: { network: network.valueOf(), action: 'accept' } })
                    if (!response.error) {
                      $(accept).remove()
                      $(decline).remove()
                      $(inviteMessage).empty().append((<span><vs-tick></vs-tick> You've now joined {network.name}. Check the permissions in the Networks tab.</span>).render(domRenderer))
                    } else {
                      accept.loading = false
                    }
                  }}>Accept & Join {network.name}</vs-btn>
                <vs-btn
                  ref={el => { decline = el }}
                  onClick={async () => {
                    decline.loading = true
                    const response = await client.sendPromise('room', { invitation: { network: network.valueOf(), action: 'decline' } })
                    if (!response.error) {
                      $(accept).remove()
                      $(decline).remove()
                      $(inviteMessage).empty().append((<span><vs-cross></vs-cross> You have declined the invite to join the {network.name} network.</span>).render(domRenderer))
                    } else {
                      accept.loading = false
                    }
                  }}
                  type="asLink">decline</vs-btn>
              </div>
            </div>).render(domRenderer)
            // const thisInvite = $('<div></div>').addClass('invitation').append(
            //   $('<h3>').append(network.name.render())
            // ).append(
            //   accept.bind('click', async () => {
            //     // join the network
            //     accept.get(0).loading = true
            //     const response = await client.sendPromise('room', { invitation: { network: network.valueOf(), action: 'accept' } })
            //     if (!response.error) {
            //       accept.remove()
            //       decline.remove()
            //       const joined = $('<span>').append(
            //         $('<span>').html(`You've now joined `)
            //       ).append(
            //         network.name.render()
            //       ).append($('<span>').html(`. Check the permissions in the Networks tab.`))
            //       thisInvite.append(
            //         joined
            //       )
            //     } else {
            //       accept.get(0).loading = false
            //     }
            //   })
            // ).append(
            //   decline.bind('click', async () => {
            //     // decline the network
            //     decline.get(0).loading = true
            //     const response = await client.sendPromise('room', { invitation: { network: network.valueOf(), action: 'decline' } })
            //     if (!response.error) {
            //       accept.remove()
            //       decline.remove()
            //       thisInvite.append(
            //         $('<span>').html('Invite declined').append($('<vs-cross></vs-cross>'))
            //       )
            //     } else {
            //       accept.get(0).loading = false
            //     }
            //   })
            // )
            // return thisInvite
          })
        )
      } else {
        container.append($('<div></div>').html('You have no pending invites. If you require access to another Venue in your Network, click Networks and request access for that Venue.'))
      }
    }
    drawList()
    return container
  }
}

export { User }
