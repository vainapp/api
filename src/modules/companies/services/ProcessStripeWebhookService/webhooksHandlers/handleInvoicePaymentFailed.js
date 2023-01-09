export const handleInvoicePaymentFailed = async (payload) => {
  const { object: invoice } = payload.data

  console.log('invoice', JSON.stringify(invoice, null, 2))
}
