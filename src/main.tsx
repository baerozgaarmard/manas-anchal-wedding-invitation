import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { InvitationBoundary } from "./components/InvitationBoundary";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <InvitationBoundary>
      <App />
    </InvitationBoundary>
  </React.StrictMode>,
);
