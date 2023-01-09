export default function isDateAfterNow(date) {
  const now = Date.now()
  const dateTimestamp = date.getTime()

  return dateTimestamp > now
}
