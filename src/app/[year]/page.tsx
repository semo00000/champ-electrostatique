import { notFound } from "next/navigation";
import { getYearData } from "@/lib/curriculum";
import { YearPageClient } from "./YearPageClient";

interface Props {
  params: Promise<{ year: string }>;
}

export default async function YearPage({ params }: Props) {
  const { year: yearId } = await params;
  const year = getYearData(yearId);

  if (!year) {
    notFound();
  }

  return <YearPageClient yearId={yearId} year={year} />;
}
