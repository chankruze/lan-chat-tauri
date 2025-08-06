import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./tailwind.css";
import PeersIndexPage from "@/pages/peers";
import { ChatProvider } from "@/context/ChatContext";
import { NotificationContainer } from "@/components/notifications/NotificationContainer";

const root = document.getElementById("root");

ReactDOM.createRoot(root as HTMLElement).render(
  <React.StrictMode>
    <ChatProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<PeersIndexPage />} />
        </Routes>
        <NotificationContainer />
      </BrowserRouter>
    </ChatProvider>
  </React.StrictMode>,
);
