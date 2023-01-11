export const generateCustomerSubscriptionDeletedMock = ({ customer_id }) => ({
  type: 'customer.subscription.deleted',
  data: {
    object: {
      customer: customer_id,
    },
  },
})
