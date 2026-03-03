import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getYearData,
  getFiliereData,
  getSubjectData,
  getTopicData,
  getAdjacentTopics,
} from "@/lib/curriculum";
import { getLessonDataAsync, hasQuizDataAsync } from "@/lib/lessons";
import { isFirstTopic as checkFirstTopic } from "@/lib/premium-access";
import { TopicPageClient } from "./TopicPageClient";

interface TopicPageProps {
  params: Promise<{
    year: string;
    filiere: string;
    subject: string;
    topic: string;
  }>;
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { year, filiere, subject, topic: topicId } = await params;
  const topicData = getTopicData(year, filiere, subject, topicId);
  const subjectData = getSubjectData(year, filiere, subject);

  if (!topicData || !subjectData) return {};

  return {
    title: topicData.title.fr,
    description: `Cours et exercices: ${topicData.title.fr} - ${subjectData.title.fr}`,
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { year: yearId, filiere: filiereId, subject: subjectId, topic: topicId } = await params;

  const year = getYearData(yearId);
  const filiere = getFiliereData(yearId, filiereId);
  const subject = getSubjectData(yearId, filiereId, subjectId);
  const topic = getTopicData(yearId, filiereId, subjectId, topicId);

  if (!year || !filiere || !subject || !topic) {
    notFound();
  }

  const lesson = await getLessonDataAsync(yearId, filiereId, subjectId, topicId);
  const hasQuiz = await hasQuizDataAsync(yearId, filiereId, subjectId, topicId);
  const adjacent = getAdjacentTopics(yearId, filiereId, subjectId, topicId);

  const simulationUrl = topic.simulation
    ? `/${yearId}/${filiereId}/${subjectId}/${topicId}/sim`
    : undefined;

  const prevTopicLink = adjacent.prev
    ? {
        title: adjacent.prev.title,
        href: `/${yearId}/${filiereId}/${subjectId}/${adjacent.prev.id}`,
      }
    : null;

  const nextTopicLink = adjacent.next
    ? {
        title: adjacent.next.title,
        href: `/${yearId}/${filiereId}/${subjectId}/${adjacent.next.id}`,
      }
    : null;

  const firstTopic = checkFirstTopic(subject.topics, topicId);

  return (
    <TopicPageClient
      yearId={yearId}
      filiereId={filiereId}
      subjectId={subjectId}
      topicId={topicId}
      yearTitle={year.title}
      filiereTitle={filiere.title}
      subjectTitle={subject.title}
      topicTitle={topic.title}
      lesson={lesson}
      hasQuiz={hasQuiz}
      hasSimulation={!!topic.simulation}
      simulationUrl={simulationUrl}
      prevTopic={prevTopicLink}
      nextTopic={nextTopicLink}
      isFirstTopic={firstTopic}
    />
  );
}
