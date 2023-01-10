import faker from '@faker-js/faker'

export const generateInvoicePaymentFailedMock = ({ customer_id }) => ({
  type: 'invoice.payment_failed',
  data: {
    object: {
      id: faker.datatype.uuid(),
      customer: customer_id,
      subscription: {
        items: {
          data: [
            {
              price: {
                id: faker.datatype.uuid(),
                product: faker.datatype.uuid(),
              },
            },
          ],
        },
      },
      lines: {
        data: [
          {
            price: {
              id: faker.datatype.uuid(),
              product: faker.datatype.uuid(),
            },
            description: 'Payment failure description',
          },
        ],
      },
    },
  },
})
