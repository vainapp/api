export default function generateRandomPassword() {
  return Math.random().toString(36).slice(-8)
}
