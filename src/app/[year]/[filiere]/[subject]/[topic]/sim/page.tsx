import { notFound } from "next/navigation";
import {
  getYearData,
  getFiliereData,
  getSubjectData,
  getTopicData,
} from "@/lib/curriculum";
import { SimPageClient } from "./SimPageClient";

interface SimPageProps {
  params: Promise<{
    year: string;
    filiere: string;
    subject: string;
    topic: string;
  }>;
}

export default async function SimPage({ params }: SimPageProps) {
  const { year: yearId, filiere: filiereId, subject: subjectId, topic: topicId } = await params;

  const year = getYearData(yearId);
  const filiere = getFiliereData(yearId, filiereId);
  const subject = getSubjectData(yearId, filiereId, subjectId);
  const topic = getTopicData(yearId, filiereId, subjectId, topicId);

  if (!year || !filiere || !subject || !topic || !topic.simulation) {
    notFound();
  }

  return (
    <SimPageClient
      yearId={yearId}
      filiereId={filiereId}
      subjectId={subjectId}
      topicId={topicId}
      yearTitle={year.title}
      filiereTitle={filiere.title}
      subjectTitle={subject.title}
      topicTitle={topic.title}
      simulationFolder={topic.simulation}
    />
  );
}
