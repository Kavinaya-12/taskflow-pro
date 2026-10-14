const mongoose = require('mongoose')

const connectDB = async () => {
  const timeout = Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 10000
  const conn = await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: timeout })
  console.log(`MongoDB Connected: ${conn.connection.host}`)
}

module.exports = connectDB
