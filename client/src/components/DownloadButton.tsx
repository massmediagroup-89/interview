import React, { useEffect, useRef, useState } from 'react'
import { fetchBlob, fs } from '../mocks'
import { Loading } from './Loading'
import { ArticleScreenQuery, ClassScreenQuery, CourseScreenQuery, MeditationScreenQuery } from '../graphql'

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
  contentPiece: Course | Meditation | Class | Article
  downloadClick(): void
}

export const DownloadButton: React.FC<Props> = ({contentPiece, downloadClick = () => {}}) => {
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [percentage, setPercentage] = useState<number>(0);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);

  const path = contentPiece.__typename;
  const loadTimeout = 10;

  let interval = useRef(0);

  const isContentOnDownloads = async (): Promise<void> => {
    const dataByPath = await fs.readFile(path)

    if (!dataByPath) {
      setIsDownloaded(false)

      return
    }

    const data = [...JSON.parse(dataByPath)]
    if (data.find(item => item.id === contentPiece.id)) {
      setIsDownloaded(true)

      return
    }

    setIsDownloaded(false)
  }

  useEffect(() => {
    isContentOnDownloads();
  }, [])

  const writeToStorage = async (data: any[]) => {
    const file = JSON.stringify(data);

    await fs.writeFile(path, file);
  }

  const writeContent = async () => {
    let data: any[] = []
    const response = await fs.readFile(path)

    if(response && response.length) {
      data = [...JSON.parse(response)]
    }

    data.push(contentPiece);
    await writeToStorage(data);
  }

  const startLoadProgress = () => {
    setPercentage(0);
    clearInterval(interval.current);

    interval.current = window.setInterval(() => {
      setPercentage(percentage => {
        if(percentage >= 100) {
          clearInterval(interval.current);
          setInProgress(false);

          return percentage
        }

        return percentage + 1
      });
    }, loadTimeout);
  }

  const onDownloadClick = async () => {
    setInProgress(true);

    await writeContent();
    startLoadProgress();

    setIsDownloaded(true);
  };

  const removePieceContent = async () => {
    const dataByPath = await fs.readFile(path);

    if (!dataByPath) {
      return
    }

    const data = [...JSON.parse(dataByPath)];
    const filteredData = data.filter(item => item.id !== contentPiece.id);

    if (!filteredData.length) {
      return;
    }

    await writeToStorage(filteredData);
  }

  const onCancelClick = async () => {
    clearInterval(interval.current);
    setInProgress(false);

    await removePieceContent();

    setIsDownloaded(false);
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
            <button onClick={onCancelClick}>
              <span>Cancel</span>
              {inProgress && (
                <div>
                  <Loading />
                  <span>{`${percentage}%`}</span>
                </div>
              )}
            </button>
          </div>)
        : (<button onClick={() => downloadClick()}>Download content</button>)
      }
    </div>
  );
};
