'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import type { Producto, Categoria } from '@/lib/types';
import { Plus, Edit, Trash2, LogOut, Package, Tag, Settings } from 'lucide-react';

function formatPrice(p: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p);
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/admin');
  }, [user, authLoading, router]);

  useEffect(() => {
    async function load() {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('productos').select('*').order('created_at', { ascending: false }),
        supabase.from('categorias').select('*').order('orden'),
      ]);
      if (prodRes.data) setProductos(prodRes.data);
      if (catRes.data) setCategorias(catRes.data);
      setLoading(false);
    }
    if (user) load();
  }, [user]);

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este producto?')) return;
    await supabase.from('productos').delete().eq('id', id);
    setProductos(prev => prev.filter(p => p.id !== id));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin');
  }

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Panel Admin</h1>
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition">
            <LogOut size={16} /> Salir
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Link href="/admin/productos/nuevo" className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition">
            <div className="bg-emerald-100 rounded-full p-3"><Plus size={20} className="text-emerald-600" /></div>
            <span className="text-sm font-semibold text-gray-800">Nuevo Producto</span>
          </Link>
          <Link href="/admin/categorias" className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition">
            <div className="bg-blue-100 rounded-full p-3"><Tag size={20} className="text-blue-600" /></div>
            <span className="text-sm font-semibold text-gray-800">Categorías</span>
          </Link>
          <Link href="/admin/config" className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition">
            <div className="bg-purple-100 rounded-full p-3"><Settings size={20} className="text-purple-600" /></div>
            <span className="text-sm font-semibold text-gray-800">Configuración</span>
          </Link>
          <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2">
            <div className="bg-gray-100 rounded-full p-3"><Package size={20} className="text-gray-600" /></div>
            <span className="text-sm font-semibold text-gray-800">{productos.length} productos</span>
          </div>
        </div>

        {/* Product list */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Productos</h2>
            <Link href="/admin/productos/nuevo" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition">
              + Nuevo
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400">Cargando…</div>
          ) : productos.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p>No hay productos todavía.</p>
              <Link href="/admin/productos/nuevo" className="text-emerald-600 font-medium text-sm mt-2 inline-block">Crear el primero →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {productos.map(p => (
                <div key={p.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center text-gray-300 overflow-hidden">
                    {p.fotos?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.fotos[0]} alt={p.nombre} className="w-full h-full object-cover" />
                    ) : '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{p.nombre}</p>
                    <p className="text-sm text-gray-500">{formatPrice(p.precio)} · {categorias.find(c => c.id === p.categoria_id)?.nombre || 'Sin categoría'}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white flex-shrink-0 ${p.estado === 'nuevo' ? 'bg-emerald-500' : p.estado === 'agotado' ? 'bg-gray-400' : 'bg-gray-800'}`}>
                    {p.estado}
                  </span>
                  <div className="flex gap-1 flex-shrink-0">
                    <Link href={`/admin/productos/${p.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Edit size={16} />
                    </Link>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
