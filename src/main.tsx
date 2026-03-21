import { Capacitor } from "@capacitor/core";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

if (Capacitor.isNativePlatform()) {
  document.getElementById("root")?.classList.add("native-app");
}

createRoot(document.getElementById("root")!).render(<App />);
