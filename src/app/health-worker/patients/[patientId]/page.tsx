import { use } from "react";
import { PatientDetailContainer } from "@/containers/patient-detail-container";

export const metadata = {
  title: "Patient Profile - Screen & Refer",
  description: "Community Patient Profile and Screening Launcher",
};

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const resolvedParams = use(params);
  return <PatientDetailContainer patientId={resolvedParams.patientId} />;
}
