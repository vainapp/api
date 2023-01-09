export const handleCustomerDeleted = async (payload) => {
  const { object: customer } = payload.data

  console.log('customer', JSON.stringify(customer, null, 2))
}
