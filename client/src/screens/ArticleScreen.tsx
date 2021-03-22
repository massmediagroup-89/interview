import React, { useContext, useEffect, useState } from 'react'
import { useQuery } from "@apollo/client";
import { ContentImage, TeacherImage, Media, fs } from '../mocks'
import {
  articleScreenQuery,
  ArticleScreenQuery,
  ArticleScreenQueryVariables
} from "../graphql";
import { ErrorMessage, Loading, CenterContents } from "../components";
import { DownloadButton } from '../components/DownloadButton'
import { AppContext } from '../App'
import { Article } from '../types/contentItem'

interface Props {
  id: string;
}

export const ArticleScreen: React.FC<Props> = ({ id }) => {
  const { data, error, loading } = useQuery<
    ArticleScreenQuery,
    ArticleScreenQueryVariables
  >(articleScreenQuery, {
    variables: { id }
  });

  const { isOffline } = useContext(AppContext);
  const [article, setArticle] = useState<Article | undefined>(undefined)

  useEffect(() => {
    (async () => {
      if (!data || !data.Article) return;

      const response = await fs.readFile(data.Article.__typename)
      const meditationData  = response
        ? (JSON.parse(response) as Article[]).find(item => item.id === id)
        : undefined

      if (isOffline && meditationData) setArticle(meditationData)
      if (!isOffline) setArticle(data.Article)
    })()
  }, [isOffline, data, id])

  if (loading) return <Loading />;
  if (error) return <ErrorMessage msg={JSON.stringify(error)} />;
  if (!article) return <ErrorMessage msg="Missing article data" />;

  return (
    <>
      <DownloadButton content={article} />

      <CenterContents>
        <h1 style={{ textAlign: "center" }}>Article</h1>
        <h4 style={{ textAlign: "center" }}>{article.title}</h4>
      </CenterContents>
      <ContentImage src={article.no_text_image.processed_url} />
      <TeacherImage src={article.teacher.image.processed_url} />
      {!isOffline && article.media_source && <Media src={article.media_source} />}
      {isOffline && article.media_download && <Media src={article.media_download} />}
    </>
  );
};
