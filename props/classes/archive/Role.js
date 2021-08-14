import { Observable } from 'venuescanner-js/vanilla/models/Observable'
import { RoleSchema } from 'venuescanner-js/schemas/network'
import { $ } from 'venuescanner-js/tools/elemental'
import { authService } from 'venuescanner-js/vanilla/components/auth'
import { NODE_TYPE } from 'jsx-pragmatic'
import { networkPermissions, venuePermissions } from 'venuescanner-js/constants/role_permissions'
import { notifications } from 'venuescanner-js/constants/role_notifications'
import { ModelStore } from './ModelStore'
import { popup } from 'venuescanner-js/vanilla/components/popup'
import { confirm } from 'venuescanner-js/vanilla/components/confirm'
class Role extends Observable {
  constructor (props) {
    super({ schema: RoleSchema, props })
  }
  modelType = 'Role'
  isNetworkRole () {
    return this.permissions.networkPermissions.get()
  }
  readOnly () {
    return this.network.valueOf() === null
  }
  checkboxForPermission ({ permission, network }) {
    return {
      type: NODE_TYPE.ELEMENT,
      dontObserve: true,
      render: () => {
        if (this.readOnly() ||
          (networkPermissions[permission] && !authService.hasPermission('networkPermissions', { network })) ||
          (venuePermissions[permission] && !authService.hasPermission('networkPermissions', { network }))
        ) {
          return this.permissions[permission].render({
            on: `<vs-tick></vs-tick>`,
            off: `<vs-cross></vs-cross>`
          })
        }
        return this.permissions[permission].input()
      }
    }
  }
  checkboxForNotification ({ notification, network }) {
    return {
      type: NODE_TYPE.ELEMENT,
      dontObserve: true,
      render: () => {
        // console.log(this.permissions.valueOf(), permission, this.permissions[permission].render())
        if (this.readOnly() ||
          (notifications[notification] && !authService.hasPermission('networkPermissions', { network }))
        ) {
          return this.notifications[notification].render({
            on: `<vs-tick></vs-tick>`,
            off: `<vs-cross></vs-cross>`
          })
        }
        return this.notifications[notification].input()
      }
    }
  }
  delete () {
    confirm(`Are you sure you wish to delete the Role '${this.name}'?`, async () => {
      popup.new(`Deleting Role '${this.name}' &hellip;`)
      await ModelStore.delete(this)
      popup.close()
    }, () => {

    })
  }
  rename () {
    const container = $('<div></div>').append(
      $('<h3>').html(`Change the name of &lsquo;${this.name}&rsquo;`)
    ).append(
      $('<div>').append(this.name.input())
    )
    popup.new(container, { closable: true })
  }
}

export { Role }
