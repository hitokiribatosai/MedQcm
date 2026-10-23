import CurriculumBrowser from "@/components/content/CurriculumBrowser";
export default async function Page({
  params,
}: {
  params: Promise<{ yearId: string }>;
}) {
  const { yearId } = await params;
  return <CurriculumBrowser year={Number(yearId) || -1} />;
}
