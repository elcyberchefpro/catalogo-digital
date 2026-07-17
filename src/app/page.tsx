'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Producto, Categoria } from '@/lib/types';
import { Search, Heart, X, ChevronDown } from 'lucide-react';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491112345678';

function getBadgeClass(estado: Producto['estado']) {
  if (estado === 'nuevo') return 'badge-new';
  if (estado === 'agotado') return 'badge-soldout';
  return 'badge-available';
}

function formatPrice(p: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p);
}

export default function CatalogoPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<number | null>(null);
  const [estadoFilter, setEstadoFilter] = useState<string | null>(null);
  const [favs, setFavs] = useState<number[]>([]);
  const [showFavs, setShowFavs] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('catalogo-favs');
    if (stored) setFavs(JSON.parse(stored));
  }, []);

  const toggleFav = useCallback((id: number) => {
    setFavs(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('catalogo-favs', JSON.stringify(next));
      return next;
    });
  }, []);

  // Fetch productos y categorias
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
    load();
  }, []);

  const filtered = productos.filter(p => {
    const matchSearch = !search || p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === null || p.categoria_id === catFilter;
    const matchEstado = estadoFilter === null || p.estado === estadoFilter;
    const matchFav = !showFavs || favs.includes(p.id);
    return matchSearch && matchCat && matchEstado && matchFav;
  });

  function buildWhatsAppLink(producto: Producto, talle: string, color: string) {
    const msg = encodeURIComponent(
      `Hola! Quiero consultar por ${producto.nombre} - Talle ${talle} - Color ${color}`
    );
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  }

  function buildFavsWhatsApp() {
    const favProducts = productos.filter(p => favs.includes(p.id));
    const lines = favProducts.map(p => `• ${p.nombre} - ${formatPrice(p.precio)}`).join('\n');
    const msg = encodeURIComponent(`Hola! Quiero consultar estos productos:\n${lines}`);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando catálogo…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Mi Tienda</h1>
            <button
              onClick={() => setShowFavs(!showFavs)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition ${showFavs ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'}`}
            >
              <Heart size={16} fill={showFavs ? '#be185d' : 'none'} />
              Favoritos ({favs.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar productos…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setCatFilter(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${catFilter === null ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Todos
            </button>
            {categorias.map(c => (
              <button
                key={c.id}
                onClick={() => setCatFilter(c.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${catFilter === c.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {c.nombre}
              </button>
            ))}
            <div className="relative">
              <select
                value={estadoFilter || ''}
                onChange={e => setEstadoFilter(e.target.value || null)}
                className="pl-3 pr-8 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 appearance-none cursor-pointer"
              >
                <option value="">Estado</option>
                <option value="nuevo">Nuevo</option>
                <option value="disponible">Disponible</option>
                <option value="agotado">Agotado</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
            </div>
          </div>
        </div>
      </header>

      {/* Favoritos WhatsApp Banner */}
      {favs.length > 0 && (
        <div className="bg-pink-50 border-b border-pink-100 px-4 py-3">
          <a href={buildFavsWhatsApp()} target="_blank" rel="noopener noreferrer" className="whatsapp-btn w-full justify-center text-sm">
            <Heart size={16} />
            Consultar todos mis favoritos por WhatsApp
          </a>
        </div>
      )}

      {/* Grid */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>No hay productos que coincidan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(p => (
              <div
                key={p.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm card-hover cursor-pointer"
                onClick={() => setSelectedProduct(p)}
              >
                <div className="relative">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-300 text-4xl">
                    {p.fotos?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.fotos[0]} alt={p.nombre} className="w-full h-full object-cover" />
                    ) : '📦'}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); toggleFav(p.id); }}
                    className="absolute top-2 right-2 bg-white/80 rounded-full p-1.5 hover:bg-white transition"
                  >
                    <Heart size={16} fill={favs.includes(p.id) ? '#be185d' : 'none'} color={favs.includes(p.id) ? '#be185d' : '#6b7280'} />
                  </button>
                  {p.estado !== 'disponible' && (
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold ${getBadgeClass(p.estado)}`}>
                      {p.estado === 'nuevo' ? 'NUEVO' : 'AGOTADO'}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.nombre}</p>
                  <p className="text-sm font-bold text-emerald-600 mt-1">{formatPrice(p.precio)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full md:max-w-2xl md:rounded-2xl max-h-screen md:max-h-auto overflow-y-auto">
            <div className="relative">
              <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-300 text-6xl">
                {selectedProduct.fotos?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedProduct.fotos[0]} alt={selectedProduct.nombre} className="w-full h-full object-cover" />
                ) : '📦'}
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:bg-gray-50"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedProduct.nombre}</h2>
                  {selectedProduct.estado !== 'disponible' && (
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${getBadgeClass(selectedProduct.estado)}`}>
                      {selectedProduct.estado === 'nuevo' ? 'NUEVO' : 'AGOTADO'}
                    </span>
                  )}
                </div>
                <p className="text-xl font-bold text-emerald-600">{formatPrice(selectedProduct.precio)}</p>
              </div>

              {selectedProduct.descripcion && (
                <p className="text-sm text-gray-500 mb-4">{selectedProduct.descripcion}</p>
              )}

              {/* Talles */}
              {selectedProduct.talles?.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Talle</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedProduct.talles.map(t => (
                      <button key={t} className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium hover:border-gray-900 transition">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colores */}
              {selectedProduct.colores?.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Color</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedProduct.colores.map(c => (
                      <button key={c} className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium hover:border-gray-900 transition">
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <a
                href={buildWhatsAppLink(selectedProduct, selectedProduct.talles?.[0] || '-', selectedProduct.colores?.[0] || '-')}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-btn w-full justify-center text-base py-3"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Preguntar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
