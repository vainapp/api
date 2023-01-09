export default function formatDate(date) {
  const options = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
    timeZoneName: 'short',
  }

  const formatter = new Intl.DateTimeFormat('pt-BR', options)

  return formatter.format(date)
}
