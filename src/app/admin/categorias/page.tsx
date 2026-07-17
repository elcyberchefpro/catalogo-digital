'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import type { Categoria } from '@/lib/types';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';

export default function CategoriasPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/admin');
  }, [user, authLoading, router]);

  useEffect(() => {
    supabase.from('categorias').select('*').order('orden').then(({ data }) => data && setCategorias(data));
  }, []);

  async function addCategoria() {
    if (!newName.trim()) return;
    setSaving(true);
    const orden = categorias.length;
    const { data } = await supabase.from('categorias').insert([{ nombre: newName.trim(), orden }]).select().single();
    if (data) setCategorias(prev => [...prev, data]);
    setNewName('');
    setSaving(false);
  }

  async function saveEdit(id: number) {
    if (!editingName.trim()) return;
    await supabase.from('categorias').update({ nombre: editingName.trim() }).eq('id', id);
    setCategorias(prev => prev.map(c => c.id === id ? { ...c, nombre: editingName.trim() } : c));
    setEditingId(null);
  }

  async function deleteCategoria(id: number) {
    if (!confirm('¿Eliminar esta categoría?')) return;
    await supabase.from('categorias').delete().eq('id', id);
    setCategorias(prev => prev.filter(c => c.id !== id));
  }

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-900 transition"><ArrowLeft size={20} /></Link>
          <h1 className="text-lg font-bold text-gray-900">Gestionar Categorías</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="space-y-3">
            {categorias.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
                {editingId === c.id ? (
                  <>
                    <input value={editingName} onChange={e => setEditingName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEdit(c.id)} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" autoFocus />
                    <button onClick={() => saveEdit(c.id)} className="text-sm bg-emerald-500 text-white px-3 py-2 rounded-xl font-medium hover:bg-emerald-600 transition">Guardar</button>
                    <button onClick={() => setEditingId(null)} className="text-sm text-gray-400 hover:text-gray-600 px-2">✕</button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-gray-800">{c.nombre}</span>
                    <button onClick={() => { setEditingId(c.id); setEditingName(c.nombre); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit size={15} /></button>
                    <button onClick={() => deleteCategoria(c.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={15} /></button>
                  </>
                )}
              </div>
            ))}

            {categorias.length === 0 && <p className="text-center text-gray-400 py-6">No hay categorías. Agregá la primera.</p>}

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCategoria()} className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Nueva categoría (ej: Mujer, Hombre, Accesorios)" />
              <button onClick={addCategoria} disabled={saving} className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-emerald-600 transition disabled:opacity-50 flex items-center gap-1">
                <Plus size={16} /> Agregar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
