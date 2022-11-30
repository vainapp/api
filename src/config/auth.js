import { LONG_TERM_DATA_DURATION } from './redis'

export default {
  secret: process.env.APP_SECRET,
  accessToken: {
    expiresIn: '1d',
    audience: 'AccessToken',
  },
  refreshToken: {
    expiresIn: `${LONG_TERM_DATA_DURATION}s`,
    audience: 'RefreshToken',
  },
}
