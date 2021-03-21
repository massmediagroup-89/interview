import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react'
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
import {setContent} from "../../services/saveData";
import {ContentTypeEnum} from "../../types/contentType.enum";
import {Query_Course_CoursePlayerPage_Course} from "../../graphql/types";

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

  // TODO offline course
  // const course = useMemo(  async () => {
  //     let response: string | null = null
  //     response = await fs.readFile(ContentTypeEnum.course)
  //     const courseData  = response ? (JSON.parse(response) as Query_Course_CoursePlayerPage_Course[]).find(item => item.id = id) : undefined
  //     console.log('test', isOffline ? courseData : data?.Course)
  //
  //     return data?.Course
  //     }, [isOffline]);
  let course = data?.Course


  const writeContent =  useCallback(async (): Promise<void> => {
      console.log(course)
      await setContent(ContentTypeEnum.course, course)
      // if (!course) {
      //     return
      // }
      //
      // for (let key in course) {
      //     // @ts-ignore
      //     if (!Array.isArray(course[key]) && !(typeof course[key] === 'object')) {
      //         // @ts-ignore
      //         console.log(course[key], typeof course[key])
      //     }
      //
      //     // @ts-ignore
      //     if (Array.isArray(    course[key])){
      //         console.log(key)
      //     }
      //
      //     // @ts-ignore
      //     if (course[key] && typeof course[key] === 'object') {
      //         console.log('object', key)
      //     }
      //
      // }
      //
      // let flatObject = Object.keys(course).reduce((carry, key) => {
      //     console.log(course, carry, key)
      //
      //     // @ts-ignore
      //     if (Array.isArray(course[key])) {
      //         // @ts-ignore
      //         carry = course[key].reduce((array, value, index) => {
      //             array[(key) + `[${index}]`] = value;
      //             return array;
      //         }, carry);
      //     }
      //     // } else { // @ts-ignore
      //     //     if (course[key] && typeof course[key] === 'object') {
      //     //                   console.log('objevt')
      //     //                   // Object.assign(carry, flatten(course[key], pre || key));
      //     //               } else {
      //     //                   // @ts-ignore
      //     //         carry[key] = course[key];
      //     //               }
      //     // }
      //     // @ts-ignore
      //     return carry;
      // })
      //
      // console.log(flatObject)



    // console.log('+')
    // const fileUrl = course && course.no_text_image ? course.no_text_image.processed_url : null
    // console.log(fileUrl)
    //
    // if (!fileUrl) {
    //   return
    // }

    // let file: string | ArrayBuffer | null = '';
        // await urlToBase64(fileUrl).then(result => {
    //         file = result
    //         console.log(result)
    //     })
    //   const test = fileUrl.replace(/^https?:\/\//, 'file://')
    // console.log('file', test)
    //
    // const resp = fetchBlob(file, fileUrl.replace(/^https?:\/\//, ''))
    //   console.log(resp)
  }, [course]);


  if (loading) return <Loading />;
  if (error) return <ErrorMessage msg={JSON.stringify(error)} />;
  if (!course) return <ErrorMessage msg="Missing course data" />;

  const teacher = course.teachers && course.teachers[0];
    const fileUrl = course && course.no_text_image ? course.no_text_image.processed_url : null
    const test = fileUrl ? fileUrl.replace(/^https?:\/\//, 'file://') : ''
    console.log(test)

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
