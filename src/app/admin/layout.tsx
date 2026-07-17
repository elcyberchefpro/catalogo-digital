import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Panel Admin - Mi Tienda',
  description: 'Panel de administracion del catalogo digital',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-100">{children}</body>
    </html>
  );
}
