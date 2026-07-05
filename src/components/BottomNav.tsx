export type ScreenId = "inicio" | "productos" | "clientes" | "ordenes" | "reportes";

interface NavItem {
  id: ScreenId;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "inicio", label: "Inicio", icon: "🏠" },
  { id: "productos", label: "Productos", icon: "📦" },
  { id: "clientes", label: "Clientes", icon: "👥" },
  { id: "ordenes", label: "Órdenes", icon: "🧾" },
  { id: "reportes", label: "Reportes", icon: "📊" },
];

export function BottomNav({
  active,
  onChange,
}: {
  active: ScreenId;
  onChange: (id: ScreenId) => void;
}) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={active === item.id ? "active" : ""}
          onClick={() => onChange(item.id)}
          type="button"
        >
          <span className="icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
