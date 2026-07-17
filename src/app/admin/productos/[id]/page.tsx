'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import ImageUploader from '@/components/ImageUploader';
import type { Categoria } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProductoForm() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id !== 'nuevo';

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [estado, setEstado] = useState<'disponible' | 'nuevo' | 'agotado'>('disponible');
  const [talles, setTalles] = useState('');
  const [colores, setColores] = useState('');
  const [fotos, setFotos] = useState<string[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!authLoading && !user) router.push('/admin');
  }, [user, authLoading, router]);

  useEffect(() => {
    async function load() {
      const { data: catData } = await supabase.from('categorias').select('*').order('orden');
      if (catData) setCategorias(catData);

      if (isEdit && params.id) {
        const { data } = await supabase.from('productos').select('*').eq('id', params.id).single();
        if (data) {
          setNombre(data.nombre || '');
          setDescripcion(data.descripcion || '');
          setPrecio(String(data.precio || ''));
          setCategoriaId(data.categoria_id || null);
          setEstado(data.estado || 'disponible');
          setTalles((data.talles || []).join(', '));
          setColores((data.colores || []).join(', '));
          setFotos(data.fotos || []);
        }
      }
      setLoading(false);
    }
    if (user) load();
  }, [user, isEdit, params.id, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !precio) return alert('Completá nombre y precio');
    setSaving(true);

    const productoData = {
      nombre,
      descripcion,
      precio: parseFloat(precio),
      categoria_id: categoriaId,
      estado,
      talles: talles.split(',').map(t => t.trim()).filter(Boolean),
      colores: colores.split(',').map(c => c.trim()).filter(Boolean),
      fotos,
    };

    if (isEdit) {
      await supabase.from('productos').update(productoData).eq('id', params.id);
    } else {
      await supabase.from('productos').insert([productoData]);
    }

    setSaving(false);
    router.push('/admin/dashboard');
  }

  if (authLoading || loading) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-900 transition"><ArrowLeft size={20} /></Link>
          <h1 className="text-lg font-bold text-gray-900">{isEdit ? 'Editar producto' : 'Nuevo producto'}</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Nombre del producto" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" placeholder="Descripción del producto" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Precio (ARS) *</label>
              <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
              <select value={categoriaId || ''} onChange={e => setCategoriaId(e.target.value ? Number(e.target.value) : null)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Sin categoría</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
            <div className="flex gap-2">
              {(['disponible', 'nuevo', 'agotado'] as const).map(est => (
                <button key={est} type="button" onClick={() => setEstado(est)} className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition ${estado === est ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {est.charAt(0).toUpperCase() + est.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Talles</label>
              <input value={talles} onChange={e => setTalles(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="S, M, L, XL" />
              <p className="text-xs text-gray-400 mt-1">Separados por coma</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Colores</label>
              <input value={colores} onChange={e => setColores(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Rojo, Azul, Negro" />
              <p className="text-xs text-gray-400 mt-1">Separados por coma</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fotos del producto</label>
            <ImageUploader onUploadComplete={urls => setFotos(urls)} />
            {fotos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {fotos.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={url} alt={`Foto ${i + 1}`} className="w-16 h-16 object-cover rounded-lg border" />
                ))}
              </div>
            )}
          </div>

          <div className="pt-2">
            <button type="submit" disabled={saving} className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50">
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
