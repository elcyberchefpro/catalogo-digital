import './globals.css';

export const metadata = {
  title: 'Catalogo Digital',
  description: 'Tu catalogo digital con pedido por WhatsApp',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
