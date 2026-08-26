import { FunctionComponent } from "react";
import { InProgressPage, Title } from "@fyrstain/hl7-front-library";
import i18n from "i18next";
import LegioPage from "../../components/LegioPage/LegioPage";

const InProgress: FunctionComponent = () => (
  <LegioPage loading={false} fitFooter={true}>
    <InProgressPage
      heading={<Title level={1} prefix={i18n.t("status.inProgress.prefix", { defaultValue: "Work in progress!" })} content={i18n.t("status.inProgress.content", { defaultValue: "Coming soon..." })} />}
      illustration={<img src={(process.env.PUBLIC_URL ?? "") + "/assets/InProgress.png"} alt="" />}
    />
  </LegioPage>
);

export default InProgress;
