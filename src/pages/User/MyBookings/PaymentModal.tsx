import React, { useState } from 'react'
import { X, CreditCard, Smartphone } from 'lucide-react'

interface PaymentModalProps {
  event: any
  onClose: () => void
  onSuccess: () => void
}

export function PaymentModal({ event, onClose, onSuccess }: PaymentModalProps) {
  const [method, setMethod] = useState<'khalti' | 'esewa' | null>(null)
  const [loading, setLoading] = useState(false)

  const amount = Number(event.price) || 0

  const handlePay = async () => {
    if (!method) return alert('Please select a payment method')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      if (method === 'khalti') {
        // Khalti payment initiation
        const res = await fetch('http://localhost:3000/api/payment/khalti/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            eventId: event.id,
            amount: amount * 100, // Khalti uses paisa (1 Rs = 100 paisa)
            eventName: event.title,
          }),
        })
        const data = await res.json()
        if (res.ok && data.payment_url) {
          // Redirect to Khalti payment page
          window.location.href = data.payment_url
        } else {
          alert(data.error || 'Khalti payment failed')
        }

      } else if (method === 'esewa') {
        // eSewa uses a form POST
        const res = await fetch('http://localhost:3000/api/payment/esewa/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            eventId: event.id,
            amount: amount,
            eventName: event.title,
          }),
        })
        const data = await res.json()
        if (res.ok) {
          // eSewa requires a form submission
          const form = document.createElement('form')
          form.method = 'POST'
          form.action = 'https://rc-web.esewa.com.np/api/epay/main/v2/form' // sandbox
          Object.entries(data.fields).forEach(([key, value]) => {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = key
            input.value = value as string
            form.appendChild(input)
          })
          document.body.appendChild(form)
          form.submit()
        } else {
          alert(data.error || 'eSewa payment failed')
        }
      }
    } catch {
      alert('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Complete Booking</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Event Summary */}
        <div className="bg-[#0f1419] rounded-xl p-4 mb-6 border border-gray-800">
          <p className="text-gray-400 text-xs mb-1">Booking for</p>
          <h3 className="text-white font-bold text-base mb-2">{event.title}</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">{new Date(event.event_date).toLocaleDateString()}</span>
            <span className="text-[#4fd1c5] font-bold text-lg">
              {amount === 0 ? 'FREE' : `Rs. ${amount}`}
            </span>
          </div>
        </div>

        {/* Free event — no payment needed */}
        {amount === 0 ? (
          <button
            onClick={async () => {
              setLoading(true)
              try {
                const token = localStorage.getItem('token')
                const res = await fetch('http://localhost:3000/api/client/book-event', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ eventId: event.id }),
                })
                if (res.ok) {
                  onSuccess()
                } else {
                  const data = await res.json()
                  alert(data.error || 'Booking failed')
                }
              } catch {
                alert('Could not connect to server')
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#2d5f5d] hover:bg-[#3d7a77] text-white font-semibold transition-colors"
          >
            {loading ? 'Confirming...' : 'Confirm Free Booking'}
          </button>
        ) : (
          <>
            {/* Payment Method Selection */}
            <p className="text-gray-400 text-sm mb-3">Select payment method</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Khalti */}
              <button
                onClick={() => setMethod('khalti')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  method === 'khalti'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 bg-[#0f1419] hover:border-gray-600'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <span className="text-white font-semibold text-sm">Khalti</span>
                <span className="text-gray-500 text-xs">Digital Wallet</span>
              </button>

              {/* eSewa */}
              <button
                onClick={() => setMethod('esewa')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  method === 'esewa'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-700 bg-[#0f1419] hover:border-gray-600'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <span className="text-white font-semibold text-sm">eSewa</span>
                <span className="text-gray-500 text-xs">Digital Wallet</span>
              </button>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={!method || loading}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                method
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
              style={method ? { boxShadow: '0 0 20px rgba(59,130,246,0.4)' } : {}}
            >
              {loading
                ? 'Processing...'
                : method
                ? `Pay Rs. ${amount} with ${method === 'khalti' ? 'Khalti' : 'eSewa'}`
                : 'Select a payment method'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}