import React, { useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'

export function PostEventCard() {
  const [isLoading, setIsLoading] = useState(false)
  
  // 1. Add State to hold form data
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    description: ''
  })

  // 2. Helper to update state when user types
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 3. Send data to Backend
      const response = await fetch('http://localhost:5000/api/admin/post-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          event_date: formData.date, // Matches SQL column 'event_date'
          event_time: formData.time, // Matches SQL column 'event_time'
          description: formData.description
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Event Posted Successfully!')
        // Clear form
        setFormData({ title: '', date: '', time: '', description: '' }) 
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error posting event:', error)
      alert('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[#161b22]/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl hover:border-[#2d5f5d]/30 transition-all duration-300">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-[#2d5f5d]/10 text-[#2d5f5d]">
          <CalendarPlus className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-white">Post an Event</h3>
      </div>

      <form onSubmit={handlePost} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            label="Event Title" 
            placeholder="Annual Team Retreat" 
          />
          <Input 
            name="date" 
            type="date" 
            value={formData.date} 
            onChange={handleChange} 
            label="Date" 
          />
          <Input 
            name="time" 
            type="time" 
            value={formData.time} 
            onChange={handleChange} 
            label="Time" 
          />
        </div>

        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          label="Description"
          placeholder="Enter event details, location, and agenda..."
          rows={3}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full md:w-auto min-w-[150px]"
          >
            Post Event
          </Button>
        </div>
      </form>
    </div>
  )
}