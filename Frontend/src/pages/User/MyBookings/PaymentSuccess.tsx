import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export function PaymentSuccess() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem('token')

      // ── eSewa v2 returns base64 encoded `data` param ──
      const esewaData = params.get('data')

      // ── Khalti returns pidx directly ──
      const pidx = params.get('pidx')

      try {
        if (esewaData) {
          // Decode base64 eSewa response
          const decoded = JSON.parse(atob(esewaData))
          console.log('eSewa decoded response:', decoded)

          // Extract eventId from transaction_uuid
          // Format: EVENT-{eventId}-USER-{userId}-{timestamp}
          const parts = decoded.transaction_uuid?.split('-')
          const eventId = parts?.[1]

          const res = await fetch('http://localhost:3000/api/payment/esewa/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              transaction_uuid: decoded.transaction_uuid,
              total_amount: decoded.total_amount,
              eventId: eventId,
            }),
          })

          const result = await res.json()
          console.log('eSewa verify result:', result)

          if (res.ok && result.success) {
            setStatus('success')
          } else {
            setStatus('failed')
          }

        } else if (pidx) {
          // Khalti verification
          const orderIdParam = params.get('purchase_order_id')
          const eventId = orderIdParam?.split('-')[1]

          const res = await fetch('http://localhost:3000/api/payment/khalti/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ pidx, eventId }),
          })

          const result = await res.json()
          if (res.ok && result.success) {
            setStatus('success')
          } else {
            setStatus('failed')
          }

        } else {
          // No recognized params
          setStatus('failed')
        }
      } catch (err) {
        console.error('Payment verification error:', err)
        setStatus('failed')
      }

      // Redirect after 2.5 seconds
      setTimeout(() => navigate('/user-dashboard'), 2500)
    }

    verify()
  }, [])

  return (
    <div className="min-h-screen bg-[#0f1419] flex items-center justify-center text-white">
      <div className="text-center space-y-4">
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 border-4 border-[#4fd1c5] border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-xl font-bold">Verifying Payment...</h2>
            <p className="text-gray-400">Please wait while we confirm your booking.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 rounded-full bg-[#2d5f5d]/30 border-2 border-[#4fd1c5] flex items-center justify-center mx-auto">
              <span className="text-4xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-[#4fd1c5]">Booking Confirmed!</h2>
            <p className="text-gray-400">Your payment was successful.</p>
            <p className="text-gray-500 text-sm">Redirecting to dashboard...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto">
              <span className="text-4xl">✗</span>
            </div>
            <h2 className="text-2xl font-bold text-red-400">Payment Failed</h2>
            <p className="text-gray-400">Something went wrong with your payment.</p>
            <p className="text-gray-500 text-sm">Redirecting to dashboard...</p>
          </>
        )}
      </div>
    </div>
  )
}