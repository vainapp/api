export const handleCustomerSubscriptionDeleted = async (payload) => {
  const { object: subscription } = payload.data

  console.log('subscription', JSON.stringify(subscription, null, 2))
}
