const test = require('node:test')
const assert = require('node:assert/strict')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

process.env.NODE_ENV = 'production'
process.env.JWT_SECRET = 'test-secret-that-is-at-least-thirty-two-characters-long'
process.env.CORS_ORIGIN = ' https://web.taskflow.test , https://admin.taskflow.test '

const User = require('../models/User')
const Task = require('../models/Task')
const app = require('../server')

const originalUserMethods = {}
const originalTaskMethods = {}
const userRows = new Map()
const taskRows = new Map()
let sequence = 1
let failUserDelete = false
let failTaskCreate = false

const nextId = () => (sequence++).toString(16).padStart(24, '0')
const clone = (value) => value ? { ...value } : value
const assertValidTask = (data) => {
  if (typeof data.title !== 'string' || !data.title.trim() || (data.status && !['Pending', 'Completed'].includes(data.status)) || (data.priority && !['High', 'Medium', 'Low'].includes(data.priority))) {
    const error = new Error('Task validation failed')
    error.name = 'ValidationError'
    throw error
  }
}
const makeQuery = (resolver) => {
  let excludedFields = []
  return {
    select(selection) { excludedFields = selection.split(/\s+/).filter((field) => field.startsWith('-')).map((field) => field.slice(1)); return this },
    then(resolve, reject) {
      return Promise.resolve().then(resolver).then((doc) => {
        if (!excludedFields.length || !doc) return doc
        const projected = clone(doc)
        for (const field of excludedFields) delete projected[field]
        return projected
      }).then(resolve, reject)
    },
  }
}

const installModelMocks = () => {
  for (const key of ['findOne', 'create', 'findById', 'findByIdAndUpdate', 'findByIdAndDelete']) {
    originalUserMethods[key] = User[key]
  }
  for (const key of ['create', 'find', 'findById', 'findByIdAndUpdate', 'deleteMany']) {
    originalTaskMethods[key] = Task[key]
  }
  const originalStartSession = User.db.startSession
  originalUserMethods.startSession = originalStartSession

  User.findOne = async (filter) => [...userRows.values()].find((user) =>
    Object.entries(filter).every(([key, value]) => {
      if (key === '_id' && value?.$ne) return user._id !== String(value.$ne)
      if (key === 'email' && value?.$regex) return new RegExp(value.$regex, value.$options).test(user.email)
      return user[key] === value
    })
  ) || null
  User.create = async (data) => {
    const user = { _id: nextId(), tokenVersion: 0, ...data }
    user.save = async () => { userRows.set(user._id, user); return user }
    userRows.set(user._id, user)
    return user
  }
  User.findById = (id) => makeQuery(() => userRows.get(String(id)) || null)
  User.findByIdAndUpdate = (id, updates) => makeQuery(async () => {
    const user = userRows.get(String(id))
    if (!user) return null
    Object.assign(user, updates)
    return user
  })
  User.findByIdAndDelete = async (id) => {
    if (failUserDelete) throw new Error('simulated user removal failure')
    const user = userRows.get(String(id)) || null
    userRows.delete(String(id))
    return user
  }
  User.db.startSession = async () => ({
    async withTransaction(callback) {
      const oldUsers = new Map([...userRows].map(([key, user]) => [key, clone(user)]))
      const oldTasks = new Map([...taskRows].map(([key, task]) => [key, clone(task)]))
      try { await callback() } catch (error) {
        userRows.clear(); for (const [key, row] of oldUsers) userRows.set(key, row)
        taskRows.clear(); for (const [key, row] of oldTasks) taskRows.set(key, row)
        throw error
      }
    },
    async endSession() {},
  })

  Task.create = async (data) => {
    if (failTaskCreate) throw new Error('simulated task database failure')
    assertValidTask(data)
    const task = { _id: nextId(), status: 'Pending', priority: 'Medium', category: 'General', createdAt: new Date().toISOString(), ...data }
    task.deleteOne = async () => taskRows.delete(task._id)
    taskRows.set(task._id, task)
    return task
  }
  Task.find = (filter) => ({ sort: async () => [...taskRows.values()].filter((task) => task.user === String(filter.user)) })
  Task.findById = async (id) => taskRows.get(String(id)) || null
  Task.findByIdAndUpdate = async (id, updates) => {
    const task = taskRows.get(String(id))
    if (!task) return null
    assertValidTask({ ...task, ...updates })
    Object.assign(task, updates)
    return task
  }
  Task.deleteMany = async (filter) => {
    for (const [id, task] of taskRows) if (task.user === String(filter.user)) taskRows.delete(id)
  }
}

const restoreModelMocks = () => {
  for (const [key, method] of Object.entries(originalUserMethods)) {
    if (key === 'startSession') User.db.startSession = method
    else User[key] = method
  }
  for (const [key, method] of Object.entries(originalTaskMethods)) Task[key] = method
}

const request = async (origin, path, { method = 'GET', token, body, rawBody } = {}) => {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const response = await fetch(`${origin}${path}`, {
    method,
    headers,
    body: rawBody ?? (body === undefined ? undefined : JSON.stringify(body)),
  })
  const text = await response.text()
  let data
  try { data = JSON.parse(text) } catch { data = text }
  return { response, data }
}

test('auth, task ownership, profile/password, errors, CORS, and atomic account deletion', async (t) => {
  userRows.clear(); taskRows.clear(); sequence = 1; failUserDelete = false; failTaskCreate = false
  installModelMocks()
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  const origin = `http://127.0.0.1:${server.address().port}`
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve))
    restoreModelMocks()
  })

  assert.throws(() => app.validateEnvironment({ JWT_SECRET: process.env.JWT_SECRET }), /MONGO_URI is required/)
  assert.throws(() => app.validateEnvironment({ MONGO_URI: 'mongodb://test', JWT_SECRET: 'short' }), /at least 32 characters/)
  assert.doesNotThrow(() => app.validateEnvironment({ MONGO_URI: 'mongodb://test', JWT_SECRET: process.env.JWT_SECRET }))
  const srvTimeout = new Error('querySrv ETIMEOUT _mongodb._tcp.example.invalid')
  srvTimeout.code = 'ETIMEOUT'
  assert.match(app.getStartupDiagnostics(srvTimeout).message, /DNS SRV lookup timed out/)
  assert.deepEqual(app.getAllowedOrigins({ configuredOrigins: ' https://one.test , https://two.test ', nodeEnv: 'production' }), ['https://one.test', 'https://two.test'])
  assert.deepEqual(app.getAllowedOrigins({ configuredOrigins: '', nodeEnv: null }), ['http://localhost:5173'])
  assert.deepEqual(app.getAllowedOrigins({ configuredOrigins: '', nodeEnv: 'production' }), [])
  await assert.rejects(app.start({ connect: async () => { throw new Error('simulated database unavailable') } }), /simulated database unavailable/)

  const invalidRegister = await request(origin, '/api/auth/register', { method: 'POST', body: { name: '', email: 'bad', password: '123' } })
  assert.equal(invalidRegister.response.status, 400)
  const first = await request(origin, '/api/auth/register', { method: 'POST', body: { name: ' Alice ', email: 'ALICE@example.test ', password: 'secret1' } })
  assert.equal(first.response.status, 201)
  assert.equal(first.data.email, 'alice@example.test')
  assert.equal('password' in first.data, false)
  const uppercaseLegacyUser = await User.create({ name: 'Legacy', email: 'Legacy@Example.test', password: await require('bcryptjs').hash('secret4', 10) })
  const legacyLogin = await request(origin, '/api/auth/login', { method: 'POST', body: { email: 'legacy@example.test', password: 'secret4' } })
  assert.equal(legacyLogin.response.status, 200, 'case-insensitive lookup supports legacy mixed-case email records')
  userRows.delete(uppercaseLegacyUser._id)
  const duplicate = await request(origin, '/api/auth/register', { method: 'POST', body: { name: 'Alice', email: 'alice@example.test', password: 'secret1' } })
  assert.equal(duplicate.response.status, 409)
  const badLogin = await request(origin, '/api/auth/login', { method: 'POST', body: { email: 'alice@example.test', password: 'wrongpass' } })
  assert.equal(badLogin.response.status, 401)
  const login = await request(origin, '/api/auth/login', { method: 'POST', body: { email: 'alice@example.test', password: 'secret1' } })
  assert.equal(login.response.status, 200)
  const userToken = login.data.token

  for (const token of [undefined, 'invalid.token.value', jwt.sign({ id: first.data._id, exp: Math.floor(Date.now() / 1000) - 1 }, process.env.JWT_SECRET)]) {
    const denied = await request(origin, '/api/auth/me', { token })
    assert.equal(denied.response.status, 401)
  }
  const me = await request(origin, '/api/auth/me', { token: userToken })
  assert.equal(me.response.status, 200)
  assert.equal('password' in me.data, false)
  assert.equal('tokenVersion' in me.data, false)
  assert.equal(me.response.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(me.response.headers.get('x-frame-options'), 'DENY')

  const second = await request(origin, '/api/auth/register', { method: 'POST', body: { name: 'Bob', email: 'bob@example.test', password: 'secret2' } })
  const otherUserTasks = await request(origin, '/api/tasks', { token: second.data.token })
  assert.deepEqual(otherUserTasks.data, [])
  const missingTitle = await request(origin, '/api/tasks', { method: 'POST', token: userToken, body: {} })
  assert.equal(missingTitle.response.status, 400)
  failTaskCreate = true
  const databaseFailure = await request(origin, '/api/tasks', { method: 'POST', token: userToken, body: { title: 'No false success' } })
  assert.equal(databaseFailure.response.status, 500)
  assert.equal(databaseFailure.data.message, 'Server error')
  failTaskCreate = false
  const created = await request(origin, '/api/tasks', { method: 'POST', token: userToken, body: { title: 'First task' } })
  assert.equal(created.response.status, 201)
  const taskId = created.data._id

  assert.ok(created.data.dueDate == null, 'a task created without dueDate stores null')
  const dated = await request(origin, '/api/tasks', { method: 'POST', token: userToken, body: { title: 'Dated', dueDate: '2026-03-09' } })
  assert.equal(dated.response.status, 201)
  assert.equal(dated.data.dueDate, '2026-03-09')
  for (const bad of ['not-a-date', '2026-13-01', '2026-02-30', '09/03/2026', 20260309, '2026-3-9']) {
    const rejected = await request(origin, '/api/tasks', { method: 'POST', token: userToken, body: { title: 'Bad', dueDate: bad } })
    assert.equal(rejected.response.status, 400, `dueDate ${JSON.stringify(bad)} must be rejected`)
  }
  const dueSet = await request(origin, `/api/tasks/${dated.data._id}`, { method: 'PUT', token: userToken, body: { dueDate: '2026-01-15' } })
  assert.equal(dueSet.data.dueDate, '2026-01-15')
  const dueCleared = await request(origin, `/api/tasks/${dated.data._id}`, { method: 'PUT', token: userToken, body: { dueDate: '' } })
  assert.ok(dueCleared.data.dueDate == null, 'empty dueDate clears it back to null')
  assert.equal((await request(origin, `/api/tasks/${dated.data._id}`, { method: 'PUT', token: userToken, body: { dueDate: '2026-99-99' } })).response.status, 400)
  await request(origin, `/api/tasks/${dated.data._id}`, { method: 'DELETE', token: userToken })
  const ownerSpoof = await request(origin, `/api/tasks/${taskId}`, { method: 'PUT', token: userToken, body: { title: 'Updated', user: second.data._id, status: 'Completed' } })
  assert.equal(ownerSpoof.response.status, 200)
  assert.equal(ownerSpoof.data.user, first.data._id)
  assert.equal(ownerSpoof.data.status, 'Completed')
  for (const method of ['PUT', 'DELETE']) {
    const foreign = await request(origin, `/api/tasks/${taskId}`, { method, token: second.data.token, body: { title: 'Stolen' } })
    assert.equal(foreign.response.status, 401)
  }
  assert.equal((await request(origin, '/api/auth/logout', { method: 'POST', token: second.data.token })).response.status, 200)
  assert.equal((await request(origin, '/api/tasks', { token: second.data.token })).response.status, 401)
  assert.equal((await request(origin, `/api/tasks/${taskId}`, { method: 'PUT', token: userToken, body: { title: 'bad', status: 'Unknown' } })).response.status, 400)
  assert.equal((await request(origin, '/api/tasks/not-an-id', { method: 'DELETE', token: userToken })).response.status, 400)
  assert.equal((await request(origin, '/api/tasks', { method: 'POST', token: userToken, rawBody: '{' })).response.status, 400)
  assert.equal((await request(origin, '/api/tasks', { method: 'GET', token: userToken })).data.length, 1)

  const profile = await request(origin, '/api/auth/profile', { method: 'PUT', token: userToken, body: { name: 'Alice A', email: 'alice.new@example.test', password: 'injected' } })
  assert.equal(profile.response.status, 200)
  assert.equal(profile.data.name, 'Alice A')
  assert.equal('password' in profile.data, false)
  assert.equal((await request(origin, '/api/auth/profile', { method: 'PUT', token: userToken, body: { name: 'Alice', email: 'bob@example.test' } })).response.status, 409)
  assert.equal((await request(origin, '/api/auth/update-password', { method: 'PUT', token: userToken, body: { currentPassword: 'wrongpass', newPassword: 'secret3' } })).response.status, 400)
  const changedPassword = await request(origin, '/api/auth/update-password', { method: 'PUT', token: userToken, body: { currentPassword: 'secret1', newPassword: 'secret3' } })
  assert.equal(changedPassword.response.status, 200)
  assert.equal(typeof changedPassword.data.token, 'string')
  assert.equal((await request(origin, '/api/tasks', { token: userToken })).response.status, 401, 'password update invalidates old access tokens')
  assert.equal((await request(origin, '/api/tasks', { token: changedPassword.data.token })).response.status, 200, 'password update returns a replacement token')
  const newLogin = await request(origin, '/api/auth/login', { method: 'POST', body: { email: 'alice.new@example.test', password: 'secret3' } })
  assert.equal(newLogin.response.status, 200)
  assert.equal((await request(origin, `/api/tasks/${taskId}`, { method: 'DELETE', token: newLogin.data.token })).response.status, 200)

  const pendingTask = await request(origin, '/api/tasks', { method: 'POST', token: newLogin.data.token, body: { title: 'Delete with account' } })
  const userId = newLogin.data._id
  failUserDelete = true
  const failedDelete = await request(origin, '/api/auth/delete-account', { method: 'DELETE', token: newLogin.data.token })
  assert.equal(failedDelete.response.status, 500)
  assert.equal(userRows.has(userId), true)
  assert.equal(taskRows.has(pendingTask.data._id), true, 'transaction rollback preserves tasks when account deletion fails')
  failUserDelete = false
  const deleted = await request(origin, '/api/auth/delete-account', { method: 'DELETE', token: newLogin.data.token })
  assert.equal(deleted.response.status, 200)
  assert.equal(userRows.has(userId), false)
  assert.equal(taskRows.has(pendingTask.data._id), false)

  const allowedOrigin = await fetch(`${origin}/health`, { headers: { Origin: 'https://web.taskflow.test' } })
  assert.equal(allowedOrigin.headers.get('access-control-allow-origin'), 'https://web.taskflow.test')
  const secondAllowedOrigin = await fetch(`${origin}/health`, { headers: { Origin: 'https://admin.taskflow.test' } })
  assert.equal(secondAllowedOrigin.headers.get('access-control-allow-origin'), 'https://admin.taskflow.test')
  const preflight = await fetch(`${origin}/api/auth/register`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://web.taskflow.test',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  })
  assert.equal(preflight.status, 204)
  assert.equal(preflight.headers.get('access-control-allow-origin'), 'https://web.taskflow.test')
  assert.match(preflight.headers.get('access-control-allow-methods') || '', /POST/)
  const deniedOrigin = await fetch(`${origin}/health`, { headers: { Origin: 'https://attacker.example' } })
  assert.equal(deniedOrigin.status, 403)
  const localOriginDeniedInProduction = await fetch(`${origin}/health`, { headers: { Origin: 'http://localhost:5173' } })
  assert.equal(localOriginDeniedInProduction.status, 403)
  let limited
  for (let attempt = 0; attempt < 20; attempt += 1) {
    limited = await request(origin, '/api/auth/login', { method: 'POST', body: { email: 'nobody@example.test', password: 'wrongpass' } })
    if (limited.response.status === 429) break
  }
  assert.equal(limited.response.status, 429)
})
