import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type TouchEvent,
} from "react";
import AnimalModal from "./AnimalModal";

export interface AnimalInfo {
  name: string;
  age: string;
  breed: string;
  location: string;
  description: string;
  image_url: string;
}

export interface VideoItem {
  id: string;
  src: string;
  likes: number;
  comments: number;
  shares: number;
  animalInfo?: AnimalInfo;
}

interface VideoPlayerProps {
  initialVideos?: VideoItem[];
}

export default function VideoPlayer({ initialVideos = [] }: VideoPlayerProps) {
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isVideoPaused, setIsVideoPaused] = useState<boolean>(false);
  const [showPlayButton, setShowPlayButton] = useState<boolean>(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);

  const loadMoreVideos = async (page: number) => {
    const response = await fetch(`/api/videos/get?page=${page}`);
    const videos = await response.json();
    return videos;
  };
  const goToNextVideo = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPreviousVideo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartY === null) return; // Only track if touch has started

    // Prevent default scroll behavior while swiping to change video
    // This helps avoid the browser's native scroll interfering with the swipe gesture
    // Only prevent default if the swipe is predominantly vertical
    const currentY = e.touches[0].clientY;
    setTouchCurrentY(currentY);
    if (Math.abs(touchStartY - currentY) > 10 && e.cancelable) {
      // Add a small threshold to confirm vertical swipe intention
      e.preventDefault();
    }
  };

  const handleClick = () => {
    const currentVideoElement = videoRefs.current[currentIndex];
    if (!currentVideoElement) return;

    if (currentVideoElement.paused) {
      // Video is paused or ended, so play it
      currentVideoElement
        .play()
        .catch((error) => console.error("Error playing video:", error));
      setIsVideoPaused(false);
      setShowPlayButton(false); // Hide play button when video plays
    } else {
      // Video is playing, so pause it
      currentVideoElement.pause();
      setIsVideoPaused(true);
      setShowPlayButton(true); // Show play button when video pauses
    }
  };

  const handleTouchEnd = () => {
    if (touchStartY === null || touchCurrentY === null) return;

    const deltaY = touchStartY - touchCurrentY; // Positive for swipe up (next video), negative for swipe down (prev video)
    const threshold = 50; // Minimum swipe distance in pixels

    if (Math.abs(deltaY) > threshold) {
      if (deltaY > 0) {
        // Swiped up
        goToNextVideo();
      } else {
        // Swiped down
        goToPreviousVideo();
      }
    }

    // Reset touch state for the next interaction
    setTouchStartY(null);
    setTouchCurrentY(null);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchStartY(e.touches[0].clientY);
    setTouchCurrentY(e.touches[0].clientY); // Initialize currentY as well
  };

  const handleCloseModal = () => {
    setShowModal(false);
    const currentVideoElement = videoRefs.current[currentIndex];
    if (currentVideoElement) {
      // If the video was paused (e.g., by opening the modal), play it.
      if (currentVideoElement.paused) {
        currentVideoElement
          .play()
          .catch((error) =>
            console.error("Error playing video on modal close:", error)
          );
      }
      // Reflect that video is intended to be playing.
      setIsVideoPaused(false);
      setShowPlayButton(false);
    }
  };

  const handleOpenModal = () => {
    const currentVideoElement = videoRefs.current[currentIndex];
    if (currentVideoElement && !currentVideoElement.paused) {
      currentVideoElement.pause();
    }
    setShowModal(true);
    setIsVideoPaused(true); // Video is now paused
    setShowPlayButton(true); // Show play button because it's paused
  };

  useEffect(() => {
    if (!containerRef.current || videos.length === 0) return;
    const videosHeight = containerRef.current.scrollHeight / videos.length;
    containerRef.current.scrollTo({
      top: currentIndex * videosHeight,
      behavior: "smooth",
    });

    videoRefs.current.forEach((videoEl, index) => {
      if (videoEl) {
        if (index === currentIndex) {
          // Play the current video if it's paused
          if (videoEl.paused) {
            videoEl.currentTime = 0; // Reset time
            videoEl
              .play()
              .catch((error) =>
                console.error(`Error playing video ${index}:`, error)
              );
          }
          setIsVideoPaused(false); // Current video is intended to be playing
          setShowPlayButton(false); // Hide play button
        } else {
          // Pause and reset other videos
          if (!videoEl.paused) {
            videoEl.pause();
          }
          videoEl.currentTime = 0;
        }
      }
    });
  }, [currentIndex, videos]);

  useEffect(() => {
    if (currentIndex >= videos.length - 1)
      loadMoreVideos(page).then((videos) => {
        setVideos((prevVideos) => [...prevVideos, ...videos]);
        if (videos.length > 0) setPage((prevPage) => prevPage + 1);
      });
  }, [page, currentIndex]);

  const currentVideo = videos[currentIndex];

  return (
    <div className="w-full bg-black relative">
      {/* Contenedor de videos con scroll */}
      <div
        className="w-full h-[calc(100dvh-4rem)] overflow-y-auto relative bg-black"
        style={{
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
        ref={containerRef}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {videos.map((video, index) => (
          <div
            key={video.id}
            id={`video-${index}`}
            className={`relative w-full h-full flex items-center justify-center`}
          >
            <div
              className="w-full md:max-w-md mx-auto h-full flex md:items-center md:justify-center"
              onClick={() => setShowModal(true)}
            >
              <div
                className="w-full h-full bg-black relative overflow-hidden"
                style={{
                  aspectRatio: "9/16",
                  maxHeight: "calc(100vh - 60px)",
                  margin: "0 auto",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                    if (el) {
                      if (index === currentIndex && !el.paused) {
                        el.play().catch((e) =>
                          console.log("Error al reproducir:", e)
                        );
                        setIsVideoPaused(false);
                      } else {
                        el.pause();
                      }
                    }
                  }}
                  src={video.src}
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay={index === currentIndex}
                  loop
                />
                {/* Botón de play/pausa superpuesto */}
                <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
                  <div
                    className={`transition-opacity duration-300 ${
                      showPlayButton ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {isVideoPaused ? (
                      <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    ) : (
                      showPlayButton && (
                        <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center">
                          <svg
                            className="w-12 h-12 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                          </svg>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* UI fija */}
      {currentVideo && (
        <div className="absolute inset-0 flex flex-col pointer-events-none">
          {/* Logo Adoptik */}
          <div className="absolute top-4 left-4 z-10 pointer-events-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                >
                  <path d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5s.3-86.2 32.6-96.8s70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3S-2.7 179.3 21.8 165.3s59.7 .9 78.5 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5v1.6c0 25.8-20.9 46.7-46.7 46.7c-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2C84.9 480 64 459.1 64 433.3v-1.6c0-10.4 1.6-20.8 5.2-30.5zM421.8 282.7c-24.5-14-29.1-51.7-10.2-84.1s54-47.3 78.5-33.3s29.1 51.7 10.2 84.1s-54 47.3-78.5 33.3zM310.1 189.7c-32.3-10.6-46.9-53.9-32.6-96.8s52.1-69.1 84.4-58.5s46.9 53.9 32.6 96.8s-52.1 69.1-84.4 58.5z" />
                </svg>
              </div>
              <h1 className="font-bold text-2xl bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Adoptik
              </h1>
            </div>
          </div>

          {/* Botón de Adoptar ahora */}
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center gap-2 py-3 px-6 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-500 text-white font-bold text-base shadow-lg transform hover:scale-105 transition-transform duration-300 animate-pulse border-2 border-white/30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="w-5 h-5"
                fill="currentColor"
              >
                <path d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5s.3-86.2 32.6-96.8s70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3S-2.7 179.3 21.8 165.3s59.7 .9 78.5 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5v1.6c0 25.8-20.9 46.7-46.7 46.7c-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2C84.9 480 64 459.1 64 433.3v-1.6c0-10.4 1.6-20.8 5.2-30.5z" />
              </svg>
              Adoptar ahora
            </button>
          </div>

          {/* Barra lateral de interacciones */}
          <div className="fixed right-3 bottom-[20%] flex flex-col gap-5">
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => console.log("Like al video:", currentVideo.id)}
                className="bg-transparent border-none text-white cursor-pointer p-2 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/10 group pointer-events-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  className="w-7 h-7 group-hover:text-[#ff2d55]"
                  fill="currentColor"
                >
                  <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
                </svg>
              </button>
              <span className="text-white text-sm font-bold">
                {currentVideo.likes}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() =>
                  console.log("Comentar en el video:", currentVideo.id)
                }
                className="bg-transparent border-none text-white cursor-pointer p-2 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/10 group pointer-events-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  className="w-7 h-7 group-hover:text-[#5ac8fa]"
                  fill="currentColor"
                >
                  <path d="M256 448c141.4 0 256-93.1 256-208S397.4 32 256 32S0 125.1 0 240c0 45.1 17.7 86.8 47.7 120.9c-1.9 24.5-11.4 46.3-21.4 62.9c-5.5 9.2-11.1 16.6-15.2 21.6c-2.1 2.5-3.7 4.4-4.9 5.7c-.6 .6-1 1.1-1.3 1.4l-.3 .3 0 0 0 0 0 0 0 0c-4.6 4.6-5.9 11.4-3.4 17.4c2.5 6 8.3 9.9 14.8 9.9c28.7 0 57.6-8.9 81.6-19.3c22.9-10 42.4-21.9 54.3-30.6c31.8 11.5 67 17.9 104.1 17.9zM128 208a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm128 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm96 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
                </svg>
              </button>
              <span className="text-white text-sm font-bold">
                {currentVideo.comments}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => console.log("Compartir video:", currentVideo.id)}
                className="bg-transparent border-none text-white cursor-pointer p-2 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/10 group pointer-events-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  className="w-7 h-7 group-hover:text-[#34c759]"
                  fill="currentColor"
                >
                  <path d="M307 34.8c-11.5 5.1-19 16.6-19 29.2v64H176C78.8 128 0 206.8 0 304C0 417.3 81.5 467.9 100.2 478.1c2.5 1.4 5.3 1.9 8.1 1.9c10.9 0 19.7-8.9 19.7-19.7c0-7.5-4.3-14.4-9.8-19.5C108.8 431.9 96 414.4 96 384c0-53 43-96 96-96h96v64c0 12.6 7.4 24.1 19 29.2s25 3 34.4-5.4l160-144c6.7-6.1 10.6-14.7 10.6-23.8s-3.8-17.7-10.6-23.8l-160-144c-9.4-8.5-22.9-10.6-34.4-5.4z" />
                </svg>
              </button>
              <span className="text-white text-sm font-bold">
                {currentVideo.shares}
              </span>
            </div>
          </div>

          {/* Renderizar el modal fuera del contenedor de scroll */}
          {showModal && (
            <AnimalModal
              isOpen={showModal}
              onClose={handleCloseModal}
              animalInfo={videos[currentIndex]?.animalInfo}
            />
          )}
          <div className="flex items-center gap-2 bg-white rounded-full px-3 py-2 fixed top-5 right-5">
            <img
              src={videos[currentIndex]?.animalInfo?.image_url}
              alt=""
              className="w-12 h-12 object-cover rounded-full"
            />
            <p className="text-xl font-bold text-black">
              {videos[currentIndex]?.animalInfo?.name}
            </p>
          </div>
        </div>
      )}

      {/* Mostrar carga */}
      {loading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
          Cargando más videos...
        </div>
      )}

      {/* Controles de navegación para desktop */}
      <div className="hidden md:flex fixed top-1/2 left-4 right-4 justify-between z-20 pointer-events-none">
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToPreviousVideo();
          }}
          className="bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 backdrop-blur-sm pointer-events-auto"
          aria-label="Anterior video"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToNextVideo();
          }}
          className="bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 backdrop-blur-sm pointer-events-auto"
          aria-label="Siguiente video"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
