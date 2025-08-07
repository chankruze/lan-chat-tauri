import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { ToastContainer } from 'react-toastify';
import "./tailwind.css";
import 'react-toastify/dist/ReactToastify.css';
import PeersIndexPage from "@/pages/peers";
import PeerChatPage from "@/pages/peers/chat";
import { ChatProvider } from "@/context/ChatContext";

const root = document.getElementById("root");

ReactDOM.createRoot(root as HTMLElement).render(
  <React.StrictMode>
    <ChatProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<PeersIndexPage />} />
          <Route path="/peers" element={<PeersIndexPage />} />
          <Route path="/peers/:peerId/chat" element={<PeerChatPage />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </ChatProvider>
  </React.StrictMode>,
);
