import { ContentImage } from "../../mocks";
import React from "react";
import { useNavigation } from '../../navigation'

interface Props {
  title: string;
  author?: string;
  image?: string
  navArgs: Parameters<ReturnType<typeof useNavigation>["navigate"]>[0];
}

export const DownloadCard: React.FC<Props> = ({ title, author, image , navArgs}) => {
  const { navigate } = useNavigation();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        background: "#ccbdaa",
        padding: 20
      }}
      onClick={() => navigate(navArgs)}
    >
      <div style={{ flex: 0, padding: 20 }}>
        <h5 style={{ margin: 0, marginBottom: 10 }}>{title}</h5>
        { author && (<h6 style={{ margin: 0 }}>{author}</h6>)}
      </div>
      { image && (
        <div style={{ flex: 1 }}>
          <ContentImage src={image} />
        </div>
      )}
    </div>
  );
};
