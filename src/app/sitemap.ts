import { getAllTopicPaths } from "@/lib/curriculum";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bac-sciences.ma";

export default function sitemap(): MetadataRoute.Sitemap {
  const topics = getAllTopicPaths();

  const topicUrls = topics.flatMap(({ year, filiere, subject, topic }) => [
    {
      url: `${BASE_URL}/${year}/${filiere}/${subject}/${topic}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/${year}/${filiere}/${subject}/${topic}/quiz`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
  ]);

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/1bac`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/2bac`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    ...topicUrls,
  ];
}
