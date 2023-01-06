const WHITE_LIST = ['/companies/stripe-webhook']

export default (fn) => (request, response, nextCallback) => {
  if (WHITE_LIST.includes(request.originalUrl)) {
    nextCallback()
  } else {
    fn(request, response, nextCallback)
  }
}
