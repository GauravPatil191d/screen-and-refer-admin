import { use } from "react";
import { EditPatientContainer } from "@/containers/edit-patient-container";

export const metadata = {
  title: "Edit Patient - Screen & Refer",
  description: "Update community patient record",
};

export default function EditPatientPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const resolvedParams = use(params);
  return <EditPatientContainer patientId={resolvedParams.patientId} />;
}
