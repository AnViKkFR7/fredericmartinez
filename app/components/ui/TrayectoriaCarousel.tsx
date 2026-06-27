import { useRef } from "react";
import useDragCarousel from "~/hooks/useDragCarousel";

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

function getRotation(diff: number): string {
  if (diff === 0) return "rotate(0deg)";
  if (diff === -1) return "rotate(-7deg) translateY(18px)";
  if (diff === 1) return "rotate(6deg) translateY(10px)";
  if (diff < -1) return `rotate(${-9 - (Math.abs(diff) - 2) * 3}deg) translateY(${22 + (Math.abs(diff) - 1) * 10}px)`;
  return `rotate(${8 + (diff - 1) * 3}deg) translateY(${14 + (diff - 1) * 10}px)`;
}

export default function TrayectoriaCarousel({ slides }: TrayectoriaCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { activeIndex, snapTo, handlers } = useDragCarousel(trackRef, slides.length, 0);

  return (
    <div className="traj-carousel-wrap">
      <div className="traj-carousel-outer" {...handlers}>
        <div className="traj-carousel-track" ref={trackRef}>
          {slides.map((slide, i) => {
            const diff = i - activeIndex;
            return (
              <article
                key={slide.id}
                className={`traj-card traj-card--${slide.color}`}
                style={{ transform: getRotation(diff) }}
              >
                <span className="traj-card-category">{slide.category}</span>
                <p className="traj-card-years">{slide.years}</p>
                <p className="traj-card-title">{slide.title}</p>
                <p className="traj-card-institution">{slide.institution}</p>
              </article>
            );
          })}
        </div>
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
