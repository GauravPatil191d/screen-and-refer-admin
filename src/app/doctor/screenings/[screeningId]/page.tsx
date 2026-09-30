import DoctorScreeningDetailContainer from "@/containers/doctor-screening-detail-container";

export default function DoctorScreeningDetailPage({
  params,
}: {
  params: Promise<{ screeningId: string }>;
}) {
  return <DoctorScreeningDetailContainer params={params} />;
}