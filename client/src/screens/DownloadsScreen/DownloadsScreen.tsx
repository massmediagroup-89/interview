import React, { useCallback, useEffect, useState } from 'react'
import { fs } from '../../mocks'
import { ContentTypeEnum } from '../../types/contentType.enum'
import { DownloadCard } from "./DownloadCard";

export const DownloadsScreen: React.FC = () => {
  const [classContent, setClassContent] = useState<any[]>([]);
  // let classContent: any[] = []

  const downloadedData = useCallback(async(path: ContentTypeEnum = ContentTypeEnum.class): Promise<any> => {
    const response = await fs.readFile(path);


    const classContent = !response ? [] : JSON.parse(response)
    setClassContent(state => [...state, ...classContent])
    console.log('classContent', classContent)
  }, [])

  useEffect(() => {
    downloadedData();
  }, [])

  return (
    <>
      <h1 style={{ textAlign: "center" }}>Downloads</h1>
      <h4>Downloaded Classes</h4>
      { classContent.map(d => <DownloadCard {...d} />) }

      {/*<h4>Downloaded Meditations</h4>*/}
      {/*{ downloadedData(ContentTypeEnum.meditation).map(d => <DownloadCard {...d} />) }*/}

      {/*<h4>Downloaded Articles</h4>*/}
      {/*{ downloadedData(ContentTypeEnum.article).map(d => <DownloadCard {...d} />) }*/}

      {/*<h4>Downloaded Courses</h4>*/}
      {/*{ downloadedData(ContentTypeEnum.course).map(d => <DownloadCard {...d} />) }*/}
    </>
  );
};
