// React-dom
import { createRoot } from "react-dom/client";
// React router dom
import { BrowserRouter } from "react-router-dom";
// Component
import App from "./App";
import UserService from "./services/UserService";
// Web vitals
import reportWebVitals from "./reportWebVitals";
// styles
import "./style.css";
import "./custom.scss";
import "bootstrap/dist/js/bootstrap.bundle.min";
// Axios
import axios from "axios";

const container = document.getElementById("root");
const root = createRoot(container!);

const _axios = axios.create({ baseURL: process.env.REACT_APP_REDIRECTURI });
_axios.interceptors.request.use(
  (config): any => {
    if (UserService.isAuthenticated()) {
      const cb = () => {
        //console.log('axios cb token: ' + UserService.getToken());
        config.headers.Authorization = `Bearer ${UserService.getToken()}`;
        return Promise.resolve(config);
      };
      //console.log('axios update token before cb Authorization Bearer');
      return UserService.updateToken(cb);
    }
  },
  (error): any => {
    return Promise.reject(error);
  },
);

const renderApp = () =>
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );

UserService.initKeycloak(renderApp);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
