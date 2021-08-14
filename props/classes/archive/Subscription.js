import { Observable } from 'venuescanner-js/vanilla/models/Observable'
import { SubscriptionSchema } from 'venuescanner-js/schemas/network'
import { subscriptionPlans } from 'venuescanner-js/vanilla/components/subscriptionPlans'

class Subscription extends Observable {
  constructor (props) {
    super({ schema: SubscriptionSchema, props })
  }
  modelType = 'Subscription'
  async subscriptionPlan () {
    return subscriptionPlans.find(this.plan)
  }
  async shouldUpgrade ({ tier, showTrials, showDiscounts } = {}) {
    const plan = await this.subscriptionPlan()
    return subscriptionPlans.findUpgrades({ plan, tier, showTrials, showDiscounts })
  }
}

export { Subscription }
