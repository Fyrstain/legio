// Day js
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
// Translation
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next, useTranslation } from "react-i18next";
// React
import { useEffect } from "react";
// React router dom
import {
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
// Pages
import Home from "./pages/Home/Home";
import Studies from "./pages/Studies/Studies";
import Error from "./pages/Error/Error";
import InProgress from "./pages/InProgress/InProgress";
import StudyDetails from "./pages/StudyDetails/StudyDetails";

require("dayjs/locale/fr");

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["fr", "en"],
  });

dayjs.extend(relativeTime);
dayjs.locale(i18n.language);

function App() {
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;

  useTranslation();

  useEffect(() => {
    if (action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [action, pathname]);

  useEffect(() => {
    let title = "";
    let metaDescription = "";

    switch (pathname) {
      case "/":
      case "/Legio":
      case "/Home":
      case "/Legio/Home":
        title = "Home page";
        metaDescription = "";
        break;
      case "/Error":
        title = "Oops !";
        metaDescription = "";
        break;
      case "/InProgress":
        title = "Coming Soon";
        metaDescription = "";
        break;
      case "/Studies":
        title = "Studies";
        metaDescription = "";
        break;
      case "/Study/:studyId":
        title = "Study Details";
        metaDescription = "";
        break;
    }

    if (title) {
      document.title = title;
    }

    if (metaDescription) {
      const metaDescriptionTag: HTMLMetaElement | null = document.querySelector(
        'head > meta[name="description"]',
      );
      if (metaDescriptionTag) {
        metaDescriptionTag.content = metaDescription;
      }
    }
  }, [pathname]);

  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/" element={<Home />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/Legio" element={<Home />} />
      <Route path="/Legio/Home" element={<Home />} />
      <Route path="/Studies" element={<Studies />} />
      <Route path="/Study/:studyId" element={<StudyDetails />} />
      <Route path="/Error" element={<Error />} />
      <Route path="/InProgress" element={<InProgress />} />
    </Routes>
  );
}

export default App;
