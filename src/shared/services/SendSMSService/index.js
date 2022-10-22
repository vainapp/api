import FakeProvider from './implementations/FakeProvider'
import SNSProvider from './implementations/SNSProvider'

const options = {
  fake: FakeProvider,
  sns: SNSProvider,
}

export default options[process.env.SMS_PROVIDER || 'fake']
