import faker from '@faker-js/faker'

export const generateInvoicePaymentSucceededMock = ({
  customer_id,
  total,
}) => ({
  type: 'invoice.payment_succeeded',
  data: {
    object: {
      id: faker.datatype.uuid(),
      customer: customer_id,
      total,
      lines: {
        data: [
          {
            price: {
              id: faker.datatype.uuid(),
              product: faker.datatype.uuid(),
            },
            period: {
              end: faker.date.future().getTime() / 1000,
            },
            description: 'Payment description',
          },
        ],
      },
    },
  },
})
