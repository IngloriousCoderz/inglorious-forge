export function saturate(num, limit) {
  if (num < -limit) return -limit
  if (num > limit) return limit
  return num
}
