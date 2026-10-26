// React-dom
import { createRoot } from "react-dom/client";
// React router dom
import { BrowserRouter } from "react-router-dom";
// Component
import App from "./app/App";
import UserService from "./shared/services/UserService";
import { installRequestAuthorization } from "./shared/services/RequestAuthorization";
// Web vitals
import reportWebVitals from "./reportWebVitals";
// styles
import "./style.css";
import "./custom.scss";
import 'bootstrap/dist/js/bootstrap.bundle.min';

const container = document.getElementById("root");
const root = createRoot(container!);

const renderApp = () => root.render(
  <BrowserRouter basename={process.env.PUBLIC_URL}>
    <App />
  </BrowserRouter>
);

installRequestAuthorization();
UserService.initKeycloak(renderApp);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
