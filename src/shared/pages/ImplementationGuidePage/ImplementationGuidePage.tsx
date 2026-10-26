import { toPublicUrl } from "../../services/PublicUrl";
import "./ImplementationGuidePage.css";

export default function ImplementationGuidePage() {
  return (
    <main className="implementation-guide-page">
      <iframe
        className="implementation-guide-page__frame"
        src={toPublicUrl("/ig/index.html")}
        title="Guides d'implémentation FHIR R4 et R5"
      />
    </main>
  );
}
