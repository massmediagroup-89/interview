import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { fetchBlob, fs } from '../mocks'
import { Loading } from './Loading'
import { ArticleScreenQuery, ClassScreenQuery, CourseScreenQuery, MeditationScreenQuery } from '../graphql'
import {
  MediaArray,
  replaceHttpsPrefixToFile,
  replaceHttpToSpace,
  urlToBase64, writeContent,
  writeToStorage
} from '../services/saveData'
import { AppContext } from '../App'
import { isNotNull } from '../types'

const divStyles: React.CSSProperties = {
  padding: 10,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-evenly",
  flexDirection: "column",
};

export type Course = CourseScreenQuery["Course"];
export type Meditation = MeditationScreenQuery["Meditation"];
export type Class = ClassScreenQuery["Class"];
export type Article = ArticleScreenQuery["Article"];

interface Props {
  content: Course | Meditation | Class | Article
}

export const DownloadButton: React.FC<Props> = ({content}) => {
  const { isOffline } = useContext(AppContext);

  const [inProgress, setInProgress] = useState<boolean>(false);
  const [percentage] = useState<number>(0);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [mediaArray, setMediaArray] = useState<MediaArray[]>([]);

  const path = content.__typename;

  let interval = useRef(0);

  useEffect(() => {
    (async (): Promise<void> => {
      const dataByPath = await fs.readFile(path)

      if (!dataByPath) {
        setIsDownloaded(false)

        return
      }

      const data = [...JSON.parse(dataByPath)]
      if (data.find(item => item.id === content.id)) {
        setIsDownloaded(true)

        return
      }

      setIsDownloaded(false)
    })()
  }, [isOffline, content.id, path])

  const onDownloadClick = useCallback(async () => {
    setInProgress(true);

    await setContent(content.__typename, content)

    setIsDownloaded(true);
  }, [content]);

  const removePieceContent = async () => {
    const dataByPath = await fs.readFile(path);

    if (!dataByPath) {
      return
    }

    const data = [...JSON.parse(dataByPath)];
    const filteredData = data.filter(item => item.id !== content.id);

    if (!filteredData.length) {
      return;
    }

    await writeToStorage(content.__typename, filteredData);

    mediaArray.forEach(item => {
      if (!fs.exists(item.path)) {
        return
      }

      fs.unlink(item.path)
    })
  }

  const onCancelClick = async () => {
    clearInterval(interval.current);
    setInProgress(false);

    await removePieceContent();

    setIsDownloaded(false);
  }

  // TODO progress function
  // const progress = (value: number) => {
  //   setPercentage(Math.round( value / 100))
  // }

  const setContent = async (key: string, content: Course | Meditation | Class | Article | undefined) => {
    if (!content) return;

    const data: Course | Meditation | Class | Article = JSON.parse(JSON.stringify(content))
    const mediaArray: MediaArray[] = []

    if ('image' in data && data.image) {
      const replacedUrl = replaceHttpsPrefixToFile(data.image.processed_url);

      mediaArray.push({path: replacedUrl, value: data.image.processed_url})
      data.image.processed_url = replacedUrl
    }

    if ('media_download' in data && data.media_download) {
      const replacedUrl = replaceHttpToSpace(data.media_download);

      mediaArray.push({path: replacedUrl, value: data.media_download})
      data.media_download = replacedUrl
    }

    if (data.no_text_image) {
      const replacedUrl = replaceHttpsPrefixToFile(data.no_text_image.processed_url);

      mediaArray.push({path: replacedUrl, value: data.no_text_image.processed_url})
      data.no_text_image.processed_url = replacedUrl
    }

    if ('teacher' in data && data.teacher) {
      const replacedUrl = replaceHttpsPrefixToFile(data.teacher.image.processed_url);

      mediaArray.push({path: replacedUrl, value: data.teacher.image.processed_url})
      data.teacher.image.processed_url = replaceHttpsPrefixToFile(data.teacher.image.processed_url)
    }

    if ('teachers' in data && data.teachers) {
      data.teachers.forEach(item => {
        if (!item) {
          return
        }
        const replacedUrl = replaceHttpsPrefixToFile(item.image.processed_url);

        mediaArray.push({path: replacedUrl, value: item.image.processed_url})
        item.image.processed_url = replaceHttpsPrefixToFile(item.image.processed_url)
      })
    }

    if ('chapters' in data && data.chapters) {
      (data.chapters || []).filter(isNotNull).forEach((chapter, idx) => {
        chapter.modules.forEach(module => {
          if(module.module_type === "AUDIO" ||
            module.module_type === "VIDEO") {

            if (module.media_download) {
              const replacedUrl = replaceHttpToSpace(module.media_download);

              mediaArray.push({path: replacedUrl, value: module.media_download})
              module.media_download = replacedUrl
            }

            return
          }

          if(module.module_type === "PDF") {
            if (module.file) {
              const replacedUrl = replaceHttpsPrefixToFile(module.file);

              mediaArray.push({path: replacedUrl, value: module.file})
              module.file = replaceHttpsPrefixToFile(module.file)
            }
          }
        })
      })
    }

    await writeContent(key, data)

    setMediaArray(mediaArray)

    for (const media of mediaArray) {
      if (media.path.endsWith(".jpg") || media.path.endsWith(".png")) {
        media.path =  media.path.replace(/^file?:\/\//, '')

        await urlToBase64(media.value).then(result => {
          fetchBlob(result as string, media.path)
          // TODO set progress
          // response.onProgress(progress)
        })

        continue
      }

      fetchBlob(media.path, media.path)
    }
  }

  return (
    <div
      style={{
        ...divStyles,
      }}
    >
      {
        (inProgress || isDownloaded)
          ? (<div>
            <button onClick={() => onCancelClick()}>
              <span>Cancel</span>
              {inProgress && (
                <div>
                  <Loading />
                  <span>{`${percentage}%`}</span>
                </div>
              )}
            </button>
          </div>)
        : (<button onClick={() => onDownloadClick()}>Download content</button>)
      }
    </div>
  );
};
