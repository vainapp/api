export const generateCustomerDeletedMock = ({ customer_id }) => ({
  type: 'customer.deleted',
  data: {
    object: {
      id: customer_id,
    },
  },
})
