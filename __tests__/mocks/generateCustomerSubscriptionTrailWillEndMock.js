export const generateCustomerSubscriptionTrailWillEndMock = ({
  customer_id,
}) => ({
  type: 'customer.subscription.trial_will_end',
  data: {
    object: {
      customer: customer_id,
      description: 'Trail description',
    },
  },
})
