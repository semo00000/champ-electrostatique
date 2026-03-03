import { notFound } from "next/navigation";
import {
  getYearData,
  getFiliereData,
  getSubjectData,
  getTopicData,
} from "@/lib/curriculum";
import { isFirstTopic } from "@/lib/premium-access";
import { getQuizDataAsync } from "@/lib/lessons";
import { QuizPageClient } from "./QuizPageClient";

interface QuizPageProps {
  params: Promise<{
    year: string;
    filiere: string;
    subject: string;
    topic: string;
  }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { year: yearId, filiere: filiereId, subject: subjectId, topic: topicId } = await params;

  const year = getYearData(yearId);
  const filiere = getFiliereData(yearId, filiereId);
  const subject = getSubjectData(yearId, filiereId, subjectId);
  const topic = getTopicData(yearId, filiereId, subjectId, topicId);

  if (!year || !filiere || !subject || !topic) {
    notFound();
  }

  const questions = await getQuizDataAsync(yearId, filiereId, subjectId, topicId);

  if (!questions || questions.length === 0) {
    notFound();
  }

  const firstTopic = isFirstTopic(subject.topics, topicId);

  return (
    <QuizPageClient
      yearId={yearId}
      filiereId={filiereId}
      subjectId={subjectId}
      topicId={topicId}
      yearTitle={year.title}
      filiereTitle={filiere.title}
      subjectTitle={subject.title}
      topicTitle={topic.title}
      questions={questions}
      hasSimulation={!!topic.simulation}
      isFirstTopic={firstTopic}
    />
  );
}
