import { FunctionComponent } from "react";
import { useLocation } from "react-router-dom";
import { ErrorDetails, ErrorPage as SharedErrorPage, Title } from "@fyrstain/hl7-front-library";
import i18n from "i18next";
import LegioPage from "../../components/LegioPage/LegioPage";

type ErrorPageProps = { error?: ErrorDetails; notFound?: boolean };

const getReasonKey = (error: ErrorDetails) => `status.error.reason.${error.kind}`;

const Error: FunctionComponent<ErrorPageProps> = ({ error: suppliedError, notFound = false }) => {
  const locationError = (useLocation().state as { error?: ErrorDetails } | null)?.error;
  const error = suppliedError ?? locationError ?? ({ kind: notFound ? "not-found" : "generic" } as ErrorDetails);

  return (
    <LegioPage loading={false} fitFooter={true}>
      <SharedErrorPage
        description={i18n.t(getReasonKey(error), { defaultValue: i18n.t("status.error.reason.generic", { defaultValue: "An unexpected error occurred." }) })}
        detailsLabel={i18n.t("status.error.details", { defaultValue: "Technical details" })}
        error={error}
        genericMessage={i18n.t("status.error.reason.generic", { defaultValue: "An unexpected error occurred." })}
        heading={<Title level={1} prefix={i18n.t("status.error.oops", { defaultValue: "Oops!" })} content={i18n.t("status.error.problem", { defaultValue: "Something went wrong" })} />}
        homeHref={(process.env.PUBLIC_URL ?? "") + "/Home"}
        homeLabel={i18n.t("status.error.home", { defaultValue: "Back to home" })}
        httpStatusLabel={(status) => i18n.t("status.error.httpStatus", { status, defaultValue: `HTTP status: ${status}` })}
        illustration={<img src={(process.env.PUBLIC_URL ?? "") + "/assets/oops.png"} alt={i18n.t("status.error.oops", { defaultValue: "Oops!" })} />}
      />
    </LegioPage>
  );
};

export default Error;
