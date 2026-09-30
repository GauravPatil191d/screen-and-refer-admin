import { use } from "react";
import { NewScreeningContainer } from "@/containers/new-screening-container";

export const metadata = {
  title: "Conduct Patient Screening - Screen & Refer",
  description: "Standardized dynamic health screening questionnaire",
};

export default function NewScreeningPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const resolvedParams = use(params);
  return <NewScreeningContainer patientId={resolvedParams.patientId} />;
}
