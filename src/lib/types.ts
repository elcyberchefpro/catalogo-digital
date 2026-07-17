export interface Categoria {
  id: number;
  nombre: string;
  orden: number;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria_id: number;
  estado: 'disponible' | 'agotado' | 'nuevo';
  talles: string[];
  colores: string[];
  fotos: string[];
  created_at: string;
}

export interface CartItem {
  producto: Producto;
  talle: string;
  color: string;
}
