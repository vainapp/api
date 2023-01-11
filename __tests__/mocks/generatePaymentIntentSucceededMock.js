import faker from '@faker-js/faker'

export const generatePaymentIntentSucceededMock = ({ customer_id }) => ({
  type: 'payment_intent.succeeded',
  data: {
    object: {
      id: faker.datatype.uuid(),
      customer: customer_id,
      charges: {
        data: [
          {
            id: faker.datatype.uuid(),
          },
        ],
      },
    },
  },
})
