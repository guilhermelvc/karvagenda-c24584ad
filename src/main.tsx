import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import GoogleAnalytics from "./components/GoogleAnalytics";

createRoot(document.getElementById("root")!).render(
  <>
    <GoogleAnalytics />
    <App />
  </>
);
