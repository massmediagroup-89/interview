import React, { useContext, useEffect, useState } from 'react'
import { useQuery } from "@apollo/client";
import { ContentImage, TeacherImage, Media, fs } from '../mocks'
import {
  meditationScreenQuery,
  MeditationScreenQuery,
  MeditationScreenQueryVariables
} from "../graphql";
import { ErrorMessage, Loading, CenterContents } from "../components";
import { DownloadButton } from '../components/DownloadButton'
import { AppContext } from '../App'
import { Meditation } from '../types/contentItem'

interface Props {
  id: string;
}

export const MeditationScreen: React.FC<Props> = ({ id }) => {
  const { data, error, loading } = useQuery<
    MeditationScreenQuery,
    MeditationScreenQueryVariables
  >(meditationScreenQuery, {
    variables: { id }
  });

  const { isOffline } = useContext(AppContext);
  const [meditation, setMeditation] = useState<Meditation | undefined>(undefined)

  useEffect(() => {
    (async () => {
      if (!data || !data.Meditation) return;

      const response = await fs.readFile(data.Meditation.__typename)
      const meditationData  = response
        ? (JSON.parse(response) as Meditation[]).find(item => item.id === id)
        : undefined

      if (isOffline && meditationData) setMeditation({...meditation, ...meditationData})
      if (!isOffline) setMeditation({...meditation, ...data.Meditation})
    })()
  }, [isOffline, data, id, meditation])

  if (loading) return <Loading />;
  if (error) return <ErrorMessage msg={JSON.stringify(error)} />;
  if (!meditation) return <ErrorMessage msg="Missing meditation data" />;

  return (
    <>
      <DownloadButton content={meditation} />

      <CenterContents>
        <h1 style={{ textAlign: "center" }}>Meditation</h1>
        <h4 style={{ textAlign: "center" }}>{meditation.title}</h4>
      </CenterContents>
      <ContentImage src={meditation.no_text_image.processed_url} />
      <TeacherImage src={meditation.teacher.image.processed_url} />
      <Media src={isOffline ? meditation.media_download : meditation.media_source} />
    </>
  );
};
