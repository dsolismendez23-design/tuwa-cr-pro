import { useState } from "react";
import { Header } from "./components/Header";
import { BottomNav, type ScreenId } from "./components/BottomNav";
import { ToastProvider } from "./components/Toast";
import { ProductosScreen } from "./modules/productos/ProductosScreen";
import { ClientesScreen } from "./modules/clientes/ClientesScreen";
import { OrdenesScreen } from "./modules/ordenes/OrdenesScreen";
import { ReportesScreen } from "./modules/reportes/ReportesScreen";

export default function App() {
  const [screen, setScreen] = useState<ScreenId>("productos");

  return (
    <ToastProvider>
      <div className="app-shell">
        <Header screen={screen} />
        <main className="app-main">
          {screen === "productos" && <ProductosScreen />}
          {screen === "clientes" && <ClientesScreen />}
          {screen === "ordenes" && <OrdenesScreen />}
          {screen === "reportes" && <ReportesScreen />}
        </main>
        <BottomNav active={screen} onChange={setScreen} />
      </div>
    </ToastProvider>
  );
}
