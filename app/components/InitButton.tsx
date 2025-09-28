'use client'

import { useState } from 'react'

export default function InitButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const initializeData = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/init', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Test data inserted successfully!')
        // Refresh the page to show new data
        window.location.reload()
      } else {
        setMessage('Error: ' + data.error)
      }
    } catch (error) {
      setMessage('Failed to initialize data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 mb-8">
      <button
        onClick={initializeData}
        disabled={loading}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Initializing...' : 'Initialize Test Data'}
      </button>

      {message && (
        <p className={`text-center ${message.includes('Error') || message.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}
    </div>
  )
}