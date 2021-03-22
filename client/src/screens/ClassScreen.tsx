import React, { useContext, useEffect, useState } from 'react'
import { useQuery } from "@apollo/client";
import { ContentImage, TeacherImage, Media, fs } from '../mocks'
import {
  classScreenQuery,
  ClassScreenQuery,
  ClassScreenQueryVariables
} from "../graphql";
import { ErrorMessage, Loading, CenterContents } from "../components";
import { DownloadButton } from '../components/DownloadButton'
import { AppContext } from '../App'
import { Class } from '../types/contentItem'

interface Props {
  id: string;
}

export const ClassScreen: React.FC<Props> = ({ id }) => {
  const { data, error, loading } = useQuery<
    ClassScreenQuery,
    ClassScreenQueryVariables
  >(classScreenQuery, {
    variables: { id }
  });
  const { isOffline } = useContext(AppContext);
  const [class_, setClass] = useState<Class | undefined>(undefined)

  useEffect(() => {
    (async () => {
      if (!data || !data.Class) {
        return
      }

      const response = await fs.readFile(data.Class.__typename)
      const classData  = response
        ? (JSON.parse(response) as Class[]).find(item => item.id === id)
        : undefined

      if (isOffline && classData) {
        setClass({...class_, ...classData})
      }

      if (!isOffline ) {
        setClass({...class_, ...data.Class})
      }
    })()
  }, [isOffline, data, id, class_])

  if (loading) return <Loading />;
  if (error) return <ErrorMessage msg={JSON.stringify(error)} />;
  if (!class_) return <ErrorMessage msg="Missing class data" />;

  return (
    <>
      <DownloadButton content={class_} />

      <CenterContents>
        <h1 style={{ margin: 0 }}>Class</h1>
        <h4>{class_.title}</h4>
      </CenterContents>
      <ContentImage src={class_.no_text_image.processed_url} />
      <TeacherImage src={class_.teacher.image.processed_url} />
      <Media src={isOffline ? class_.media_download : class_.media_source} />
    </>
  );
};
