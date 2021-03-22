import React from 'react'
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
  onRemove(): void
}

export const RemoveDownloadButton: React.FC<Props> = ({onRemove = () => {}}) => {
  return (
    <div
      style={{
        ...divStyles,
      }}
    >
      <button onClick={() => onRemove()}>
        remove
      </button>
    </div>
  );
};
