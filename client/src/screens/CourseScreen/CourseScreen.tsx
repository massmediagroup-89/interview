import React, { useCallback, useContext, useMemo } from 'react'
import { useQuery } from "@apollo/client";
import { ContentImage, fetchBlob, fs, TeacherImage } from '../../mocks'
import {
  courseScreenQuery,
  CourseScreenQuery,
  CourseScreenQueryVariables
} from "../../graphql";
import { ChapterList } from "./ChapterList";
import { ErrorMessage, Loading, CenterContents } from "../../components";
import { DownloadButton } from '../../components/DownloadButton'
import { AppContext } from '../../App'

interface Props {
  id: string;
}

export const CourseScreen: React.FC<Props> = ({ id }) => {
  const { data, error, loading } = useQuery<
    CourseScreenQuery,
    CourseScreenQueryVariables
  >(courseScreenQuery, {
    variables: { id }
  });

  const { isOffline, setIsOffline } = useContext(AppContext);

  const course = data?.Course;

  const urlToBase64 = (url: string): Promise<string | ArrayBuffer | null> => {
    return fetch('http://content.jwplatform.com/videos/LCpX9gQs-kZ9IxeSQ.mp4')
      .then(response => response.blob())
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        console.log(blob)
        return reader.readAsDataURL(blob)
      }))
  }


  const writeContent =  useCallback(async (): Promise<void> => {
    console.log('+')
    const fileUrl = course && course.no_text_image ? course.no_text_image.processed_url : null
    console.log(fileUrl)

    if (!fileUrl) {
      return
    }

    const file = await urlToBase64(fileUrl).then(result => console.log(result))
    console.log('file', file)

    const resp = fetchBlob(fileUrl, fileUrl)
  }, [course]);


  if (loading) return <Loading />;
  if (error) return <ErrorMessage msg={JSON.stringify(error)} />;
  if (!course) return <ErrorMessage msg="Missing course data" />;

  const teacher = course.teachers && course.teachers[0];

  return (
    <>
      <DownloadButton contentPiece={course} downloadClick={writeContent} />

      <CenterContents>
        <h1 style={{ textAlign: "center" }}>Course</h1>
        <h4 style={{ textAlign: "center" }}>{course.title}</h4>
      </CenterContents>
      <ContentImage src={course.no_text_image?.processed_url || ""} />
      <TeacherImage src={teacher?.image.processed_url || ""} />
      <h4 style={{ textAlign: "center" }}>Course content</h4>
      <ChapterList chapters={course.chapters} />
    </>
  );
};
