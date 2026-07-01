import { useRef, useState, useCallback, useEffect } from "react";
import "~/styles/SobreMi.css";

export interface TrayectoriaSlide {
  id: string;
  category: string;
  years: string;
  title: string;
  institution: string;
  color: "dark" | "blue";
}

interface TrayectoriaCarouselProps {
  slides: TrayectoriaSlide[];
}

/* ---- Mide el ancho real del stage y se actualiza en cada resize ---- */
function useContainerWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => setWidth(el.offsetWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

/* ---- Geometría de la rueda ---- */
// RADIUS se pensó para un stage de 760px (max-width actual). Esta ratio
// permite recalcularlo proporcionalmente al ancho real del contenedor,
// así la rueda no se rompe al cambiar de tamaño.
const RADIUS_RATIO = 1250 / 760;
const FALLBACK_RADIUS = 1250; // se usa antes de la primera medición (SSR / primer render)
const ANGLE_STEP = 18;

function getCardStyle(diff: number, radius: number): React.CSSProperties {
  if (diff === 0) {
    return {
      transform: `translateX(0px) translateY(0px) rotate(0deg) scale(1)`,
      opacity: 1,
      zIndex: 10,
    };
  }

  const absDiff = Math.abs(diff);
  const angleDeg = diff * ANGLE_STEP;
  const angleRad = (angleDeg * Math.PI) / 180;

  const translateX = radius * Math.sin(angleRad);
  const translateY = radius * (1 - Math.cos(angleRad));

  const scale = Math.max(0.72, 1 - absDiff * 0.14);
  // A partir de la 2ª card hacia cada lado, invisible y sin interacción:
  // así solo hay 3 cards visibles/clicables como mucho, pase lo que pase con el clip del contenedor.
  const opacity = 1;

  return {
    transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${angleDeg}deg) scale(${scale})`,
    opacity,
    zIndex: Math.max(0, 10 - absDiff),
    pointerEvents: absDiff >= 2 ? "none" : "auto",
  };
}

/* ---- Arco: puntos + orientación tangente a la curva ---- */
const ARC_P0 = { x: 20, y: 380 };
const ARC_P1 = { x: 600, y: 20 };
const ARC_P2 = { x: 1180, y: 380 };

function pointOnArc(t: number) {
  const x = (1 - t) ** 2 * ARC_P0.x + 2 * (1 - t) * t * ARC_P1.x + t ** 2 * ARC_P2.x;
  const y = (1 - t) ** 2 * ARC_P0.y + 2 * (1 - t) * t * ARC_P1.y + t ** 2 * ARC_P2.y;
  return { x, y };
}

// Centro real de la "esfera del reloj": se calcula a partir de 3 puntos
// que SÍ están sobre la curva (t=0, t=0.5 y t=1 — P1 es solo el punto
// de control de la bezier, no pertenece a la curva). A partir de aquí,
// cada tick es literalmente "la aguja que va del centro a ese punto del borde".
function circumcenter(
  A: { x: number; y: number },
  B: { x: number; y: number },
  C: { x: number; y: number }
) {
  const D = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
  const ux =
    ((A.x ** 2 + A.y ** 2) * (B.y - C.y) +
      (B.x ** 2 + B.y ** 2) * (C.y - A.y) +
      (C.x ** 2 + C.y ** 2) * (A.y - B.y)) / D;
  const uy =
    ((A.x ** 2 + A.y ** 2) * (C.x - B.x) +
      (B.x ** 2 + B.y ** 2) * (A.x - C.x) +
      (C.x ** 2 + C.y ** 2) * (B.x - A.x)) / D;
  return { x: ux, y: uy };
}

const ARC_CENTER = circumcenter(pointOnArc(0), pointOnArc(0.5), pointOnArc(1));

const ARC_TICKS = 100;
const TICK_LENGTH = 4;

const ARC_TICK_POINTS = Array.from({ length: ARC_TICKS }, (_, i) => {
  const t = 0.04 + (i / (ARC_TICKS - 1)) * 0.92;
  const { x, y } = pointOnArc(t);

  // Vector radial: del centro del "reloj" hacia este punto del borde.
  const dx = x - ARC_CENTER.x;
  const dy = y - ARC_CENTER.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = dx / len;
  const ny = dy / len;

  return {
    id: i,
    x1: x - nx * (TICK_LENGTH / 2),
    y1: y - ny * (TICK_LENGTH / 2),
    x2: x + nx * (TICK_LENGTH / 2),
    y2: y + ny * (TICK_LENGTH / 2),
  };
});


export default function TrayectoriaCarousel({ slides }: TrayectoriaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const dragDelta = useRef(0);
  const DRAG_THRESHOLD = 50;

  const [stageRef, stageWidth] = useContainerWidth<HTMLDivElement>();
  const radius = stageWidth ? stageWidth * RADIUS_RATIO : FALLBACK_RADIUS;

  const snapTo = useCallback((index: number) => {
    setActiveIndex(Math.max(0, Math.min(index, slides.length - 1)));
  }, [slides.length]);

  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(false);
    startX.current = e.clientX;
    dragDelta.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    dragDelta.current = e.clientX - startX.current;
    if (Math.abs(dragDelta.current) > 8) setIsDragging(true);
  };

  const onPointerUp = () => {
    if (Math.abs(dragDelta.current) > DRAG_THRESHOLD) {
      dragDelta.current < 0 ? snapTo(activeIndex + 1) : snapTo(activeIndex - 1);
    }
    setIsDragging(false);
    dragDelta.current = 0;
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") snapTo(activeIndex - 1);
      if (e.key === "ArrowRight") snapTo(activeIndex + 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIndex, snapTo]);

  return (
    <div className="traj-carousel-wrap">
      <div className="traj-arc-container" aria-hidden>
        <svg
          className="traj-arc-svg"
          viewBox="0 0 1200 400"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          {ARC_TICK_POINTS.map(({ id, x1, y1, x2, y2 }) => (
            <line
              key={id}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#d3d3d3"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>

      <div
        ref={stageRef}
        className="traj-carousel-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        role="region"
        aria-label="Carrusel de trayectoria"
      >
        {slides.map((slide, i) => {
          const diff = i - activeIndex;
          const style = getCardStyle(diff, radius);
          return (
            <article
              key={slide.id}
              className={`traj-card traj-card--${slide.color}`}
              style={style}
              onClick={() => !isDragging && snapTo(i)}
              aria-hidden={diff !== 0}
            >
              <span className="traj-card-category">{slide.category}</span>
              <p className="traj-card-years">{slide.years}</p>
              <div className="traj-card-content">
                <p className="traj-card-title">{slide.title}</p>
                <p className="traj-card-institution">{slide.institution}</p>
              </div>

            </article>
          );
        })}
      </div>

      <div className="traj-dots" role="tablist">
        {slides.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`Slide ${i + 1}`}
            className={`traj-dot${i === activeIndex ? " traj-dot--active" : ""}`}
            onClick={() => snapTo(i)}
          />
        ))}
      </div>
    </div>
  );
}