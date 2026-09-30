import { PatientListContainer } from "@/containers/patient-list-container";

export const metadata = {
  title: "Patient Directory - Screen & Refer",
  description: "Community Patient Records Directory",
};

export default function PatientsListPage() {
  return <PatientListContainer />;
}
