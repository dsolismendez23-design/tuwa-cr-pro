const TITLES: Record<string, { title: string; subtitle: string }> = {
  inicio: { title: "TUWA CR PRO", subtitle: "Menú principal" },
  productos: { title: "Productos", subtitle: "Catálogo y precios" },
  clientes: { title: "Clientes", subtitle: "Datos y precios diferenciados" },
  ordenes: { title: "Órdenes de Compra", subtitle: "Generar y compartir" },
  reportes: { title: "Reportes", subtitle: "Historial de órdenes" },
};

export function Header({ screen }: { screen: string }) {
  const info = TITLES[screen] ?? { title: "TUWA CR PRO", subtitle: "" };
  return (
    <header className="app-header">
      <img src={`${import.meta.env.BASE_URL}logo-wordmark.png`} alt="TUWA CR PRO" />
      <div>
        <h1>{info.title}</h1>
        <p className="subtitle">{info.subtitle}</p>
      </div>
    </header>
  );
}
