import { CreatePatientContainer } from "@/containers/create-patient-container";

export const metadata = {
  title: "Register New Patient - Screen & Refer",
  description: "Register a new community patient in the clinic registry",
};

export default function CreatePatientPage() {
  return <CreatePatientContainer />;
}
