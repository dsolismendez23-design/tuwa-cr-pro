import { useEffect, useState } from "react";
import { Sheet } from "./Sheet";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandaloneDisplay() {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandaloneDisplay());
  const [showIosSheet, setShowIosSheet] = useState(false);
  const [showGenericSheet, setShowGenericSheet] = useState(false);

  useEffect(() => {
    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    function handleInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (installed) return null;

  async function handleClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
      return;
    }
    if (isIosDevice()) {
      setShowIosSheet(true);
    } else {
      setShowGenericSheet(true);
    }
  }

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={handleClick}>
        ⬇️ Descargar app
      </button>

      {showIosSheet && (
        <Sheet title="Instalar en iPhone / iPad" onClose={() => setShowIosSheet(false)}>
          <p style={{ fontSize: 13, color: "var(--tuwa-gray-700)", marginTop: 0 }}>
            En iOS la instalación se hace desde Safari, siguiendo estos pasos:
          </p>
          <ol style={{ fontSize: 13, color: "var(--tuwa-black)", paddingLeft: 20, lineHeight: 1.7 }}>
            <li>Abrí esta página en <strong>Safari</strong> (no funciona desde Chrome en iOS).</li>
            <li>
              Tocá el ícono de <strong>Compartir</strong> (el cuadrado con la flecha hacia arriba ↑).
            </li>
            <li>
              Deslizá y elegí <strong>"Agregar a pantalla de inicio"</strong>.
            </li>
            <li>
              Tocá <strong>"Agregar"</strong> arriba a la derecha.
            </li>
          </ol>
          <button className="btn btn-ghost" onClick={() => setShowIosSheet(false)}>
            Entendido
          </button>
        </Sheet>
      )}

      {showGenericSheet && (
        <Sheet title="Instalar la app" onClose={() => setShowGenericSheet(false)}>
          <p style={{ fontSize: 13, color: "var(--tuwa-gray-700)", marginTop: 0 }}>
            Tu navegador no ofreció la instalación automática, pero podés instalarla manualmente:
          </p>
          <ul style={{ fontSize: 13, color: "var(--tuwa-black)", paddingLeft: 20, lineHeight: 1.7 }}>
            <li>
              <strong>Android (Chrome):</strong> tocá el menú ⋮ (arriba a la derecha) y elegí "Instalar app" o
              "Agregar a pantalla de inicio".
            </li>
            <li>
              <strong>Computadora (Chrome/Edge):</strong> buscá el ícono de instalar ⊕ en la barra de
              direcciones, a la derecha.
            </li>
          </ul>
          <button className="btn btn-ghost" onClick={() => setShowGenericSheet(false)}>
            Entendido
          </button>
        </Sheet>
      )}
    </>
  );
}
