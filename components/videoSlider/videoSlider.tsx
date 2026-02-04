import React, { useState } from 'react';

const POSITIONS = [
  'left-far',
  'left-near',
  'center',
  'right-near',
  'right-far',
];

const VideoSlider = ({ videos = [] }: any) => {
  if (videos.length < 5) return null;

  const [startIndex, setStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const getVideo = (i: number) =>
    videos[(startIndex + i + videos.length) % videos.length];

  const slide = (dir: 'next' | 'prev') => {
    if (isAnimating) return;
    setIsAnimating(true);

    setTimeout(() => {
      setStartIndex((prev) =>
        dir === 'next'
          ? (prev + 1) % videos.length
          : (prev - 1 + videos.length) % videos.length
      );
      setIsAnimating(false);
    }, 450); // must match CSS duration
  };

  return (
    <>
      <style>{`
        .carousel-card {
          position: absolute;
          top: 0;
          left: 50%;
          width: 340px;
          height: 480px;
          border-radius: 16px;
          overflow: hidden;
          background: black;
          transition: transform 0.45s ease, opacity 0.45s ease;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        }

        .left-far { transform: translateX(-190%) scale(0.7); opacity: .3; z-index: 0; }
        .left-near { transform: translateX(-120%) scale(.85); opacity: .55; z-index: 1; }
        .center { transform: translateX(-50%) scale(1); opacity: 1; z-index: 3; }
        .right-near { transform: translateX(20%) scale(.85); opacity: .55; z-index: 1; }
        .right-far { transform: translateX(90%) scale(.7); opacity: .3; z-index: 0; }

        .card-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.9);
          border-radius: 9999px;
          padding: 12px 16px;
          font-size: 20px;
          font-weight: bold;
          z-index: 50;
          cursor: pointer;
          user-select: none;
        }

        .nav-left { left: 20px; }
        .nav-right { right: 20px; }
      `}</style>

      <div className="relative w-full h-[520px] flex items-center justify-center overflow-hidden">
        <div className="nav-btn nav-left" onClick={() => slide('prev')}>
          ‹
        </div>
        <div className="nav-btn nav-right" onClick={() => slide('next')}>
          ›
        </div>

        <div className="relative w-[420px] h-[500px]">
          {POSITIONS.map((pos, i) => (
            <div key={`${startIndex}-${pos}`} className={`carousel-card ${pos}`}>
              <video
                src={getVideo(i)}
                muted
                loop
                playsInline
                autoPlay={pos === 'center'}
                className="card-video"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default VideoSlider;
