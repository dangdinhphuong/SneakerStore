import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import { ToastContainer } from "react-toastify";
import 'react-toastify/ReactToastify.min.css'

ReactDOM.createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
      <App />
      <ToastContainer/>
    </Provider>
);
