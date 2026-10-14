import test from 'node:test'
import assert from 'node:assert/strict'
import { getTodayKey, shiftDayKey, classifyDueDate, formatDueLabel, dayKeyDifference } from '../src/utils/dates.js'

test('getTodayKey formats a local calendar date without UTC drift', () => {
  const evening = new Date(2026, 0, 2, 23, 30, 0)
  assert.equal(getTodayKey(evening), '2026-01-02')
})

test('shiftDayKey moves across month and year boundaries', () => {
  assert.equal(shiftDayKey('2026-01-31', 1), '2026-02-01')
  assert.equal(shiftDayKey('2026-03-01', -1), '2026-02-28')
  assert.equal(shiftDayKey('2024-02-28', 1), '2024-02-29') // leap year
  assert.equal(shiftDayKey('2026-12-31', 1), '2027-01-01')
})

test('classifyDueDate buckets relative to a fixed today', () => {
  const today = '2026-03-09'
  assert.equal(classifyDueDate('2026-03-08', today), 'overdue')
  assert.equal(classifyDueDate('2026-03-09', today), 'today')
  assert.equal(classifyDueDate('2026-03-10', today), 'upcoming')
  assert.equal(classifyDueDate(null, today), 'none')
  assert.equal(classifyDueDate(undefined, today), 'none')
})

test('dayKeyDifference counts whole local days', () => {
  assert.equal(dayKeyDifference('2026-03-09', '2026-03-09'), 0)
  assert.equal(dayKeyDifference('2026-03-10', '2026-03-09'), 1)
  assert.equal(dayKeyDifference('2026-03-01', '2026-03-09'), -8)
})

test('formatDueLabel uses friendly relative wording near today', () => {
  const today = '2026-03-09'
  assert.equal(formatDueLabel('2026-03-09', today), 'Today')
  assert.equal(formatDueLabel('2026-03-10', today), 'Tomorrow')
  assert.equal(formatDueLabel('2026-03-08', today), 'Yesterday')
  assert.equal(formatDueLabel('2026-03-12', today), 'In 3 days')
  assert.equal(formatDueLabel('2026-03-04', today), '5 days ago')
  assert.equal(formatDueLabel('', today), '')
})
