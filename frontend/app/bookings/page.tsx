'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

type AvailabilityResponse = { available: number[]; total: number } | { error: string };

export default function BookTablePage() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [partySize, setPartySize] = useState<number>(2);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [bookingDate, setBookingDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [bookingTime, setBookingTime] = useState<string>(() => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(Math.ceil(d.getMinutes() / 15) * 15).padStart(2, '0');
    return `${hh}:${mm === '60' ? '00' : mm}`;
  });
  const [duration, setDuration] = useState<number>(60);
  const [available, setAvailable] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startISO = useMemo(() => {
    try {
      const [h, m] = bookingTime.split(':').map(Number);
      const d = new Date(bookingDate);
      d.setHours(h || 0, m || 0, 0, 0);
      return d.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }, [bookingDate, bookingTime]);

  const fetchAvailability = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bookings/available?at=${encodeURIComponent(startISO)}&duration=${duration}`);
      const data: AvailabilityResponse = await res.json();
      if ('error' in data) throw new Error(data.error);
      setAvailable(data.available);
      if (data.available.length > 0) setSelectedTable(data.available[0]);
      else setSelectedTable(null);
    } catch (e: unknown) {
      setAvailable([]);
      setSelectedTable(null);
      setError(e instanceof Error ? e.message : 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startISO, duration]);

  const submitBooking = async () => {
    try {
      setSubmitting(true);
      setError(null);
      if (!customerName.trim()) throw new Error('Please enter your name');
      if (!customerPhone.trim()) throw new Error('Please enter your phone');
      if (!partySize || partySize < 1) throw new Error('Enter a valid party size');

      const payload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        party_size: Number(partySize),
        table_number: selectedTable || undefined,
        booking_time: startISO,
        duration_minutes: duration
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      // Optional: navigate or show a message
      alert('Booking confirmed!');
      router.push('/');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-semibold mb-6">Book a Table</h1>

        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="duration">Duration (mins)</Label>
              <Input id="duration" type="number" min={15} max={240} step={15} value={duration} onChange={(e) => setDuration(Number(e.target.value || 60))} />
            </div>
            <div>
              <Label htmlFor="party">Party Size</Label>
              <Input id="party" type="number" min={1} max={20} value={partySize} onChange={(e) => setPartySize(Number(e.target.value || 1))} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium">Available Tables</h2>
              <Button variant="secondary" onClick={fetchAvailability} disabled={loading}>{loading ? 'Checking…' : 'Refresh'}</Button>
            </div>
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            {available.length === 0 ? (
              <div className="text-gray-600 text-sm">No tables available for the selected time.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {available.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTable(t)}
                    className={`px-3 py-1 rounded border ${selectedTable === t ? 'bg-green-600 text-white border-green-600' : 'bg-green-50 text-green-700 border-green-200'}`}
                  >
                    Table {t}
                  </button>
                ))}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2">You can skip selecting a table and we will assign one automatically.</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. John Doe" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="e.g. 9876543210" />
            </div>
          </div>

          <div className="pt-2">
            <Button onClick={submitBooking} disabled={submitting}>{submitting ? 'Booking…' : 'Confirm Booking'}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}


