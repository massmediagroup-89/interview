import React, { useEffect, useState } from 'react'
import { fs } from '../../mocks'
import { ContentTypeEnum } from '../../types/contentType.enum'
import { DownloadCard } from "./DownloadCard";
import {
  Article,
  Class,
  Course,
  isArticleItem,
  isClassItem,
  isCourseItem,
  isMeditationItem,
  Meditation
} from '../../types/contentItem'

export const DownloadsScreen: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  const downloadedData = async(path: ContentTypeEnum = ContentTypeEnum.class): Promise<void> => {
    const response = await fs.readFile(path);

    const content = !response ? null : JSON.parse(response)
    if (!content || !content.length) return

    if (isClassItem(content[0])) setClasses(content)
    if (isCourseItem(content[0])) setCourses(content)
    if (isMeditationItem(content[0])) setMeditations(content)
    if (isArticleItem(content[0])) setArticles(content)
  }

  useEffect(() => {
    (async () => {
      await downloadedData(ContentTypeEnum.class);
      await downloadedData(ContentTypeEnum.meditation);
      await downloadedData(ContentTypeEnum.article);
      await downloadedData(ContentTypeEnum.course);
    })()
  }, [])

  return (
    <>
      <h1 style={{ textAlign: "center" }}>Downloads</h1>
      <h4>Downloaded Classes</h4>
      { classes.map(({ id, title, no_text_image }) =>
        <DownloadCard
          key={id}
          title={title}
          image={no_text_image.processed_url}
          navArgs={{ route: "ClassScreen", params: { id } }}
        />)}

      <h4>Downloaded Meditations</h4>
      { meditations.map(({ id, title, no_text_image }) =>
        <DownloadCard
          key={id}
          title={title}
          image={no_text_image.processed_url}
          navArgs={{ route: "MeditationScreen", params: { id } }} />) }

      <h4>Downloaded Articles</h4>
      { articles.map(({ id, title, no_text_image })  =>
        <DownloadCard
          key={id}
          title={title}
          image={no_text_image.processed_url}
          navArgs={{ route: "ArticleScreen", params: { id } }} />) }

      <h4>Downloaded Courses</h4>
      { courses.map(({ id, title, no_text_image }) =>
        <DownloadCard
          key={id}
          title={title}
          image={no_text_image?.processed_url || ""}
          navArgs={{ route: "CourseScreen", params: { id } }} />) }
    </>
  );
};

