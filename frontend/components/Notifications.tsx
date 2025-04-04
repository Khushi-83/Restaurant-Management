// components/Notification.tsx
'use client';

import { CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';

interface NotificationProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

export default function Notification({ message, show, onClose }: NotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center animate-fade-in-up">
        <CheckCircle2 className="mr-2" />
        <span>{message}</span>
      </div>
    </div>
  );
}