import React, {useContext, useEffect, useState} from 'react'
import { useQuery } from "@apollo/client";
import { ContentImage, fs, TeacherImage } from '../../mocks'
import {
  courseScreenQuery,
  CourseScreenQuery,
  CourseScreenQueryVariables
} from "../../graphql";
import { ChapterList } from "./ChapterList";
import { ErrorMessage, Loading, CenterContents } from "../../components";
import { DownloadButton } from '../../components/DownloadButton'
import { AppContext } from '../../App'
import { Course } from '../../types/contentItem'

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

  const { isOffline } = useContext(AppContext);
  const [course, setCourse] = useState<Course | undefined>(undefined)

  useEffect(() => {
    (async () => {
      if (!data || !data.Course) return;

      const response = await fs.readFile(data.Course.__typename)
      const courseData  = response
        ? (JSON.parse(response) as Course[]).find(item => item.id === id)
        : undefined

      if (isOffline && courseData) setCourse({...course, ...courseData})
      if (!isOffline) setCourse({...course, ...data?.Course})
    })()
  }, [isOffline, data, id, course])

  if (loading) return <Loading />;
  if (error) return <ErrorMessage msg={JSON.stringify(error)} />;
  if (!course) return <ErrorMessage msg="Missing course data" />;

  const teacher = course.teachers && course.teachers[0];

  return (
    <>
      <DownloadButton content={course} />

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
