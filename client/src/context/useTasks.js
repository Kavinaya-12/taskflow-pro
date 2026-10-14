import { useContext } from 'react'
import TaskContext from './TaskContextStore'

export const useTasks = () => useContext(TaskContext)
