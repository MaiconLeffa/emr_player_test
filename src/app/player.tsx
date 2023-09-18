"use client";
import {
  ChangeEvent,
  SyntheticEvent,
  useEffect,
  useRef,
  useState
} from "react";
import Hls, { Level } from "hls.js";

export default function Player() {
  const hls = useRef(new Hls());
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPaused, setIsPaused] = useState(true);
  const isMovingTimeLine = useRef(false);
  const speeds = [0.25, 0.5, 1, 1.5, 2];
  const [qualities, setQualities] = useState<Level[]>([]);

  const src =
    "https://videofront-high-volume.b-cdn.net/hls-kraus-enc/kraush-emr/video/SMSSPSP2017R11Q36_1080P/qualidade,-240,-480,-720,.mp4.drmcrete/master.m3u8";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.controls = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (Hls.isSupported()) {
      hls.current.loadSource(src);
      hls.current.attachMedia(video);
      video.controls = false;

      hls.current.on(Hls.Events.MANIFEST_PARSED, function (_, data) {
        setQualities(data.levels);
      });
    } else {
      console.error(
        "This is an old browser that does not support MSE https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API"
      );
    }
  }, [src, videoRef]);

  function seekTo(e: ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current;
    if (!video) return;
    if (isMovingTimeLine.current) {
      setProgress(Number(e.target.value));
      return;
    }

    const time = video.duration * (Number(e.target.value) / 100);
    video.currentTime = time;
  }

  function play() {
    const video = videoRef.current;
    if (!video) return;

    if (isPaused) {
      video.play();
      setIsPaused(false);
    } else {
      video.pause();
      setIsPaused(true);
    }
  }

  function readyToPlay(e: SyntheticEvent<HTMLVideoElement>) {
    setDuration(e.currentTarget.duration);
    if (videoRef.current) videoRef.current.removeAttribute("controls");
  }

  function changeQuality(level: number) {
    hls.current.currentLevel = level;
  }

  function changeVolume(e: ChangeEvent<HTMLInputElement>) {
    if (videoRef.current) videoRef.current.volume = Number(e.target.value);
  }

  function handleMouseUp(e: SyntheticEvent<HTMLInputElement>) {
    if (videoRef.current)
      videoRef.current.currentTime = Number(e.currentTarget.value);
    isMovingTimeLine.current = false;
  }

  return (
    <main className="h-screen aspect-video relative">
      <video
        controls={false}
        onCanPlay={readyToPlay}
        onTimeUpdate={(e) =>
          !isMovingTimeLine.current && setProgress(e.currentTarget.currentTime)
        }
        autoPlay={false}
        className="h-full border aspect-video"
        ref={videoRef}
      />

      <div className="absolute bottom-0 w-full bg-white/80 p-5 flex gap-2 text-white">
        <button
          className="bg-black rounded-full px-3"
          onClick={() => changeQuality(-1)}
        >
          auto
        </button>
        {qualities.map((level, index) => (
          <button
            className="bg-black rounded-full px-3"
            onClick={() => changeQuality(index)}
          >
            {level.height}
          </button>
        ))}

        <button
          className="bg-black rounded-full p-2 text-white w-[70px]"
          onClick={play}
        >
          {isPaused ? "play" : "pause"}
        </button>

        <input
          onMouseDown={() => (isMovingTimeLine.current = true)}
          onMouseUp={handleMouseUp}
          value={progress}
          max={duration}
          type="range"
          className="flex-grow"
          onChange={seekTo}
        />

        <input
          defaultValue={1}
          step={0.1}
          max={1}
          type="range"
          className="w-[100px]"
          onChange={changeVolume}
        />

        {speeds.map((speed) => (
          <button
            onClick={() => {
              if (videoRef.current) videoRef.current.playbackRate = speed;
            }}
            className="w-[60px] text-white bg-black rounded-full"
          >
            {speed}x
          </button>
        ))}
      </div>
    </main>
  );
}
