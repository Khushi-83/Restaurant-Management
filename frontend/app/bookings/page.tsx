'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Users, Phone, RefreshCcw, CheckCircle2 } from 'lucide-react';

type AvailabilityResponse = { available: number[]; total: number } | { error: string };

export default function BookTablePage() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [partySize, setPartySize] = useState<number>(2);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [autoAssign, setAutoAssign] = useState<boolean>(true);
  const [bookingDate, setBookingDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [bookingTime, setBookingTime] = useState<string>(() => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const minute = Math.min(45, Math.ceil(d.getMinutes() / 15) * 15);
    const mm = String(minute).padStart(2, '0');
    return `${hh}:${mm === '60' ? '00' : mm}`;
  });
  const [duration, setDuration] = useState<number>(60);
  const [available, setAvailable] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
      if (data.available.length > 0) {
        if (selectedTable && data.available.includes(selectedTable)) {
          // keep current selection
        } else if (autoAssign) {
          setSelectedTable(data.available[0]);
        }
      } else {
        setSelectedTable(null);
      }
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

  const quickSetTime = (minutesFromNow: number) => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + minutesFromNow, 0, 0);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    setBookingDate(d.toISOString().slice(0, 10));
    setBookingTime(`${hh}:${mm}`);
  };

  const submitBooking = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);
      if (!customerName.trim()) throw new Error('Please enter your name');
      if (!customerPhone.trim()) throw new Error('Please enter your phone');
      if (!partySize || partySize < 1) throw new Error('Enter a valid party size');

      const payload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        party_size: Number(partySize),
        table_number: autoAssign ? selectedTable || undefined : selectedTable || undefined,
        booking_time: startISO,
        duration_minutes: duration
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccessMsg('Booking confirmed! See you soon.');
      setTimeout(() => router.push('/'), 900);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = customerName.trim() && customerPhone.trim() && partySize > 0 && (autoAssign || selectedTable !== null);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Book a Table</h1>
            <p className="text-sm text-gray-600">Choose your date and time, see available tables in real-time.</p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">{successMsg}</span>
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Details */}
          <Card className="p-6 lg:col-span-2 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date" className="mb-1 inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-red-600" /> Date</Label>
                <Input id="date" type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="time" className="mb-1 inline-flex items-center gap-2"><Clock className="h-4 w-4 text-red-600" /> Time</Label>
                <Input id="time" type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="duration" className="mb-1 inline-flex items-center gap-2"><Clock className="h-4 w-4 text-red-600" /> Duration (mins)</Label>
                <div className="flex items-center gap-2">
                  <Input id="duration" type="number" min={30} max={240} step={15} value={duration} onChange={(e) => setDuration(Number(e.target.value || 60))} />
                  <div className="hidden sm:flex gap-1">
                    {[15, 30, 60].map((min) => (
                      <Button key={min} size="sm" variant="outline" onClick={() => quickSetTime(min)}>{`+${min}m`}</Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="mb-1 inline-flex items-center gap-2"><Users className="h-4 w-4 text-red-600" /> Your Name</Label>
                <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. John Doe" />
              </div>
              <div>
                <Label htmlFor="phone" className="mb-1 inline-flex items-center gap-2"><Phone className="h-4 w-4 text-red-600" /> Phone</Label>
                <Input id="phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="e.g. 9876543210" />
              </div>
            </div>

            <div>
              <Label htmlFor="party" className="mb-1 inline-flex items-center gap-2"><Users className="h-4 w-4 text-red-600" /> Party Size</Label>
              <Input id="party" type="number" min={1} max={20} value={partySize} onChange={(e) => setPartySize(Number(e.target.value || 1))} />
              <p className="text-xs text-gray-500 mt-1">We’ll do our best to seat you comfortably.</p>
            </div>
          </Card>

          {/* Right: Availability */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Available Tables</h2>
              <Button size="sm" variant="outline" onClick={fetchAvailability} disabled={loading}>
                <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{available.length} available</span>
              <button
                type="button"
                onClick={() => setAutoAssign((v) => !v)}
                className={`text-xs px-2 py-1 rounded border ${autoAssign ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
              >
                {autoAssign ? 'Auto-assign: On' : 'Auto-assign: Off'}
              </button>
            </div>

            {available.length === 0 && !loading && (
              <div className="text-gray-600 text-sm">No tables available for the selected time.</div>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {(loading ? Array.from({ length: 10 }).map((_, i) => -i - 1) : available).map((t) => (
                t < 0 ? (
                  <div key={t} className="h-9 rounded border border-gray-200 bg-gray-100 animate-pulse" />
                ) : (
                  <button
                    key={t}
                    type="button"
                    disabled={!available.includes(t)}
                    onClick={() => { setSelectedTable(t); setAutoAssign(false); }}
                    className={`h-9 rounded border text-sm font-medium transition-colors
                      ${selectedTable === t
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}
                  >
                    Table {t}
                  </button>
                )
              ))}
            </div>

            <div className="text-xs text-gray-500">You can let us auto-assign a table, or pick one manually.</div>
          </Card>
        </div>

        {/* Bottom: Summary & Confirm */}
        <Card className="mt-6 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-700">
              <span className="font-medium">Summary:</span>
              <span className="ml-2">{new Date(startISO).toLocaleString()} • {duration} mins • Party {partySize}</span>
              <span className="ml-2">• {autoAssign ? (selectedTable ? `Table ${selectedTable}` : 'Auto-assign') : (selectedTable ? `Table ${selectedTable}` : 'No table selected')}</span>
            </div>
            <Button onClick={submitBooking} disabled={submitting || !canSubmit} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white shadow-md px-6 py-6 text-base">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {submitting ? 'Booking…' : 'Confirm Booking'}
            </Button>
          </div>
        </Card>
      </div>
      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 p-3 sm:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1 text-xs text-gray-700 truncate">
            {new Date(startISO).toLocaleString()} • {duration}m • Party {partySize} • {autoAssign ? (selectedTable ? `T${selectedTable}` : 'Auto') : (selectedTable ? `T${selectedTable}` : 'No table')}
          </div>
          <Button onClick={submitBooking} disabled={submitting || !canSubmit} className="bg-red-600 hover:bg-red-700 text-white">
            {submitting ? 'Booking…' : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  );
}


