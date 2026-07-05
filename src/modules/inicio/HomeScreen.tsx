import type { ScreenId } from "../../components/BottomNav";

const MODULES: { id: ScreenId; label: string; icon: string; description: string }[] = [
  { id: "productos", label: "Productos", icon: "📦", description: "Catálogo y precios" },
  { id: "clientes", label: "Clientes", icon: "👥", description: "Datos y precios diferenciados" },
  { id: "ordenes", label: "Órdenes de Compra", icon: "🧾", description: "Generar y compartir" },
  { id: "reportes", label: "Reportes", icon: "📊", description: "Historial de órdenes" },
];

export function HomeScreen({ onNavigate }: { onNavigate: (id: ScreenId) => void }) {
  return (
    <div>
      <div style={{ textAlign: "center", margin: "10px 0 22px" }}>
        <img
          src={`${import.meta.env.BASE_URL}logo-wordmark.png`}
          alt="TUWA CR PRO"
          style={{ height: 56 }}
        />
        <p style={{ fontSize: 13, color: "var(--tuwa-gray-700)", marginTop: 8 }}>
          Elegí un módulo para comenzar
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {MODULES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onNavigate(m.id)}
            className="home-module-card"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 6,
              background: "var(--tuwa-black)",
              color: "var(--tuwa-white)",
              border: "2px solid var(--tuwa-black)",
              borderRadius: "var(--radius-lg)",
              padding: "18px 14px",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 30 }}>{m.icon}</span>
            <span style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>{m.label}</span>
            <span style={{ fontSize: 11, color: "var(--tuwa-gray-300)" }}>{m.description}</span>
            <span
              style={{
                marginTop: 6,
                fontSize: 11,
                fontWeight: 700,
                color: "var(--tuwa-orange)",
              }}
            >
              Entrar →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
