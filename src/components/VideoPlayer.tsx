import { useState, useEffect, useRef, useCallback } from "react";
import AnimalModal from "./AnimalModal";

// Eliminamos la importación de VideoTikTok ya que ahora manejamos los videos directamente
// import VideoTikTok from "./VideoTikTok";

export interface AnimalInfo {
  name: string;
  age: string;
  breed: string;
  location: string;
  description: string;
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
  loadMoreVideos?: (page: number) => Promise<VideoItem[]>;
}

export default function VideoPlayer({
  initialVideos = [],
  loadMoreVideos,
}: VideoPlayerProps) {
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isVideoPaused, setIsVideoPaused] = useState<boolean>(false);
  const [showPlayButton, setShowPlayButton] = useState<boolean>(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const hidePlayButtonTimeout = useRef<NodeJS.Timeout | null>(null);
  const modalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAnimationFrameRef = useRef<number | null>(null);
  const isScrollingRef = useRef(false);
  const touchStartY = useRef(0);
  const lastScrollTime = useRef(0);

  // Efecto para limpiar al desmontar
  useEffect(() => {
    return () => {
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
      }
      if (scrollAnimationFrameRef.current) {
        cancelAnimationFrame(scrollAnimationFrameRef.current);
      }
      if (hidePlayButtonTimeout.current) {
        clearTimeout(hidePlayButtonTimeout.current);
      }
    };
  }, []);

  // Efecto para actualizar el estado de pausa cuando cambia el video
  useEffect(() => {
    const video = videoRefs.current[currentIndex];
    if (video) {
      setIsVideoPaused(video.paused);
    }
  }, [currentIndex]);

  // Evitar que el scroll del cuerpo cuando el modal está abierto
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Pausar temporalmente el scroll mientras el modal está abierto
    if (containerRef.current) {
      containerRef.current.style.overflow = "hidden";
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);

    // Restaurar el scroll después de que la animación del modal termine
    modalTimerRef.current = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.overflow = "auto";
      }
    }, 300); // Tiempo de la animación del modal
  };
  const loadingRef = useRef(false);

  // Cargar más videos cuando se llega al final
  useEffect(() => {
    if (!loadMoreVideos || loadingRef.current) return;

    const handleScroll = async () => {
      if (!containerRef.current || loadingRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtBottom = scrollHeight - (scrollTop + clientHeight) < 100;

      if (isAtBottom) {
        try {
          loadingRef.current = true;
          setLoading(true);
          const newVideos = await loadMoreVideos(page + 1);

          if (newVideos.length > 0) {
            setVideos((prev) => [...prev, ...newVideos]);
            setPage((prev) => prev + 1);
          }
        } catch (error) {
          console.error("Error loading more videos:", error);
        } finally {
          loadingRef.current = false;
          setLoading(false);
        }
      }
    };

    const container = containerRef.current;
    container?.addEventListener("scroll", handleScroll);

    return () => {
      container?.removeEventListener("scroll", handleScroll);
    };
  }, [page, loadMoreVideos]);

  // Manejar navegación entre videos
  const goToNextVideo = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (loadMoreVideos && !loadingRef.current) {
      // Cargar más videos si estamos al final
      loadMoreVideos(page + 1).then((newVideos) => {
        if (newVideos.length > 0) {
          setVideos((prev) => [...prev, ...newVideos]);
          setPage((prev) => prev + 1);
          setCurrentIndex((prev) => prev + 1);
        }
      });
    }
  }, [currentIndex, videos.length, loadMoreVideos, page]);

  const goToPrevVideo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Manejar navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevVideo();
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        goToNextVideo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextVideo, goToPrevVideo]);

  // Manejar scroll del usuario
  const handleScroll = useCallback(() => {
    // Ignorar si estamos haciendo scroll programático
    if (isScrollingRef.current || !containerRef.current) return;

    const { scrollTop, scrollHeight } = containerRef.current;
    const videoHeight = scrollHeight / videos.length;
    const currentVideoIndex = Math.round(scrollTop / videoHeight);

    // Solo actualizar si hay un cambio significativo
    if (currentVideoIndex !== currentIndex) {
      setCurrentIndex(currentVideoIndex);
    }
  }, [currentIndex, videos.length]);

  // Efecto para manejar el scroll al cambiar de video
  useEffect(() => {
    if (!containerRef.current || isScrollingRef.current) return;

    // Bloquear actualizaciones mientras hacemos scroll programático
    isScrollingRef.current = true;

    const videoHeight = containerRef.current.scrollHeight / videos.length;
    const targetScroll = currentIndex * videoHeight;

    // Usar scrollTo con behavior: 'smooth' para una transición suave
    containerRef.current.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });

    // Actualizar reproducción de videos
    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      if (index === currentIndex) {
        video.play().catch((e) => console.log("Error al reproducir:", e));
        setIsVideoPaused(false);
      } else {
        video.pause();
      }
    });

    // Desbloquear después de la animación
    const timer = setTimeout(() => {
      isScrollingRef.current = false;
    }, 500);

    return () => clearTimeout(timer);
  }, [currentIndex, videos.length]);

  // Manejar play/pausa del video
  const togglePlayPause = useCallback(() => {
    const video = videoRefs.current[currentIndex];
    if (!video) return;

    if (video.paused) {
      video.play().catch((e) => console.log("Error al reproducir:", e));
      setIsVideoPaused(false);
    } else {
      video.pause();
      setIsVideoPaused(true);
    }

    // Mostrar el botón de play/pausa
    setShowPlayButton(true);
    // Ocultar después de 1 segundo
    if (hidePlayButtonTimeout.current) {
      clearTimeout(hidePlayButtonTimeout.current);
    }
    hidePlayButtonTimeout.current = setTimeout(() => {
      setShowPlayButton(false);
    }, 1000);
  }, [currentIndex]);

  // Manejar scroll táctil
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Deslizamiento hacia arriba - siguiente video
        goToNextVideo();
      } else {
        // Deslizamiento hacia abajo - video anterior
        goToPrevVideo();
      }
    } else {
      // Si el desplazamiento es pequeño, manejar como toque para play/pausa
      togglePlayPause();
    }
  };

  // Referencia para evitar múltiples toques rápidos
  const isHandlingClick = useRef(false);

  // Manejar clic en el video
  const handleVideoClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (isHandlingClick.current) return;
      isHandlingClick.current = true;

      const video = videoRefs.current[currentIndex];
      if (!video) {
        isHandlingClick.current = false;
        return;
      }

      // Cambiar el estado inmediatamente para feedback visual
      const wasPaused = video.paused;
      setIsVideoPaused(!wasPaused);
      setShowPlayButton(true);

      // Limpiar timeout anterior si existe
      if (hidePlayButtonTimeout.current) {
        clearTimeout(hidePlayButtonTimeout.current);
      }

      // Ocultar botón después de 1 segundo
      hidePlayButtonTimeout.current = setTimeout(() => {
        setShowPlayButton(false);
      }, 1000);

      // Manejar la reproducción/pausa
      try {
        if (wasPaused) {
          video.play().then(() => {
            // Asegurarse de que el estado sea consistente después de la reproducción
            if (!video.paused) {
              setIsVideoPaused(false);
            }
          });
        } else {
          video.pause();
          // No necesitamos then() aquí ya que pausar es síncrono
        }
      } catch (error) {
        console.error("Error al controlar el video:", error);
      } finally {
        // Permitir el próximo clic después de un pequeño retraso
        setTimeout(() => {
          isHandlingClick.current = false;
        }, 200);
      }
    },
    [currentIndex]
  );

  // Manejar evento play del video
  const handlePlay = useCallback(() => {
    // Solo actualizar si el video realmente está reproduciéndose
    const video = videoRefs.current[currentIndex];
    if (video && !video.paused) {
      setIsVideoPaused(false);
    }
  }, [currentIndex]);

  // Manejar evento pause del video
  const handlePause = useCallback(() => {
    // Solo actualizar si el video realmente está pausado
    const video = videoRefs.current[currentIndex];
    if (video && video.paused) {
      setIsVideoPaused(true);
    }
  }, [currentIndex]);

  // Mostrar el botón al pasar el ratón por encima
  const handleMouseEnter = useCallback(() => {
    setShowPlayButton(true);
  }, []);

  // Ocultar el botón después de un tiempo
  const handleMouseLeave = useCallback(() => {
    if (hidePlayButtonTimeout.current) {
      clearTimeout(hidePlayButtonTimeout.current);
    }
    hidePlayButtonTimeout.current = setTimeout(() => {
      setShowPlayButton(false);
    }, 1000);
  }, []);

  // Renderizar solo los videos cercanos al actual para mejor rendimiento
  // Obtener el video actual
  const currentVideo = videos[currentIndex];

  return (
    <div className="w-full min-h-screen bg-black relative">
      {/* Contenedor de videos con scroll */}
      <div
        ref={containerRef}
        className="w-full h-dvh overflow-y-auto relative bg-black"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onScroll={handleScroll}
        style={{
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {videos.map((video, index) => (
          <div
            key={video.id}
            id={`video-${index}`}
            className={`relative w-full h-full flex items-center justify-center`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onEnded={handlePause}
                  onSeeking={handlePause}
                  onSeeked={handlePlay}
                  onWaiting={handlePause}
                  onPlaying={handlePlay}
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
          <div className="absolute right-3 bottom-[20%] flex flex-col gap-5">
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
            goToPrevVideo();
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
