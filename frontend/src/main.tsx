import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Elemento root não encontrado");
}

createRoot(root).render(<App />);