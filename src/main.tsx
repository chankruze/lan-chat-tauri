import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./tailwind.css";
import PeersIndexPage from "@/pages/peers";

const root = document.getElementById("root");

ReactDOM.createRoot(root as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<PeersIndexPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
