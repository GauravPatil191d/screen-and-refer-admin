import ScreeningResultContainer from "@/containers/screening-result-container";

export default function ScreeningResultPage({
  params,
}: {
  params: Promise<{ screeningId: string }>;
}) {
  return <ScreeningResultContainer params={params} />;
}