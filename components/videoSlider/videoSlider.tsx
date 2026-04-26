import React from 'react';

const VideoSlider = ({ videos = [] }: any) => {
  if (videos.length === 0) return null;

  return (
    <>
      <style>{`
        .video-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          width: 100%;
          padding: 16px 0;
        }

        .video-item {
          flex: 1 1 200px;
          max-width: 340px;
          min-width: 150px;
          border-radius: 16px;
          overflow: hidden;
          background: black;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        }

        .video-item video {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          aspect-ratio: 9 / 16;
        }

        @media (max-width: 767px) {
          .video-item {
            flex: 1 1 140px;
            max-width: 200px;
          }
        }

        @media (max-width: 479px) {
          .video-item {
            flex: 1 1 100px;
            max-width: 160px;
          }
        }
      `}</style>

      <div className="video-row">
        {videos.map((src: string, index: number) => (
          <div key={index} className="video-item">
            <video
              src={src}
              muted
              loop
              playsInline
              autoPlay
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default VideoSlider;