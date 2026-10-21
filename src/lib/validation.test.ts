import assert from 'node:assert/strict'

const totalMinutesFromWorkInput = (hours: number, minutes: number): number => {
  const safeHours = Math.max(0, Math.trunc(hours))
  const safeMinutes = Math.max(0, Math.min(59, Math.trunc(minutes)))
  return safeHours * 60 + safeMinutes
}

assert.equal(totalMinutesFromWorkInput(2, 30), 150, '2 hours and 30 minutes should become 150 minutes')
assert.equal(totalMinutesFromWorkInput(0, 0), 0, 'zero input should stay zero')
assert.equal(totalMinutesFromWorkInput(1, 61), 119, 'minutes above 59 should clamp to 59 without adding extra hours')
assert.equal(totalMinutesFromWorkInput(0, 45), 45, 'minutes-only input should preserve remaining time')

console.log('validation tests passed')
