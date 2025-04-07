"use client"

import { useState } from "react"

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Thanks for your feedback!")
    setFeedback("")
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">We’d Love Your Feedback</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <textarea
          className="w-full border rounded-md p-4 h-32"
          placeholder="Share your experience or suggestions..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          required
        />
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md">
          Submit
        </button>
      </form>
    </div>
  )
}
