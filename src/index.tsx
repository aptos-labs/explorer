import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter} from "react-router-dom";
import ExplorerRoutes from "./ExplorerRoutes";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ExplorerRoutes/>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);