'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { ArrowLeft, MessageCircle, ExternalLink } from 'lucide-react';

export default function ConfigPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/admin');
  }, [user, authLoading, router]);

  useEffect(() => {
    setWhatsappNumber(localStorage.getItem('whatsapp-number') || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '');
  }, []);

  function handleSave() {
    localStorage.setItem('whatsapp-number', whatsappNumber);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-900 transition"><ArrowLeft size={20} /></Link>
          <h1 className="text-lg font-bold text-gray-900">Configuración</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle size={18} className="text-emerald-500" />
              <h2 className="font-bold text-gray-900">WhatsApp</h2>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de WhatsApp</label>
            <input
              value={whatsappNumber}
              onChange={e => setWhatsappNumber(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-3"
              placeholder="5491112345678"
            />
            <p className="text-xs text-gray-400 mb-3">Código de país + número, sin espacios ni guiones. Ej: 5491112345678 para Argentina.</p>
            <button
              onClick={handleSave}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition ${saved ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
            >
              {saved ? '✓ Guardado' : 'Guardar número'}
            </button>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="font-bold text-gray-900 mb-3">Cómo funciona el botón de WhatsApp</h2>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-2">
              <p>Cuando un cliente toca "Preguntar por WhatsApp", se abre WhatsApp con un mensaje prellenado:</p>
              <code className="block bg-white rounded-lg px-3 py-2 text-xs text-gray-800 border mt-2">
                Hola! Quiero consultar por [Nombre del producto] - Talle [X] - Color [Y]
              </code>
              <p className="pt-2">No necesitás API de WhatsApp Business. Solo el link <code className="bg-white rounded px-1.5 py-0.5 text-xs">wa.me</code>.</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="font-bold text-gray-900 mb-3">Probar link de WhatsApp</h2>
            {whatsappNumber ? (
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola! Probando el catálogo digital')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-600 transition"
              >
                <ExternalLink size={15} /> Abrir WhatsApp
              </a>
            ) : (
              <p className="text-sm text-gray-400">Guardá un número arriba para probar.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
