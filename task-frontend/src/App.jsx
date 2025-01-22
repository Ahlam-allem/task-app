import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [tasks, setTasks] = useState({ local_tasks: [], external_tasks: [] })
  const [title, setTitle] = useState('')
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/tasks')
      if (response.data.status === 'success') {
        setTasks(response.data)
        setError(null)
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Network error: Unable to fetch tasks. Please check your connection.'
      )
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSubmitError(null)
    setSuccessMessage(null)

    try {
      if (!title.trim()) {
        throw new Error('Task title cannot be empty')
      }

      const response = await axios.post('http://localhost:8000/api/tasks', {
        title,
        completed
      })

      if (response.data.status === 'success') {
        setTitle('')
        setCompleted(false)
        fetchTasks()
        setSubmitError(null)
        setSuccessMessage('Task created successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || 
        err.message ||
        'Failed to create task. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Create New Task</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="mr-2"
              />
              <label>Completed</label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </form>
          {submitError && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
              {submitError}
            </div>
          )}
          {successMessage && (
            <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
              {successMessage}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Tasks</h2>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Your Tasks</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.local_tasks.map((task) => (
                    <tr key={task.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{task.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{task.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          task.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.completed ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">External Tasks</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">External ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.external_tasks.map((task) => (
                    <tr key={task.external_id}>
                      <td className="px-6 py-4 whitespace-nowrap">{task.external_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{task.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          task.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.completed ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App