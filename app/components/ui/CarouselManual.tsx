import { useRef } from "react";
import useDragCarousel from "~/hooks/useDragCarousel";

interface Slide {
  id: string;
  number: string;
  title: string;
  text: string;
}

interface CarouselManualProps {
  slides: Slide[];
}

export default function CarouselManual({ slides }: CarouselManualProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { handlers } = useDragCarousel(trackRef, slides.length);

  return (
    <div
      className="carousel-manual-outer"
      {...handlers}
    >
      <div className="carousel-manual-track" ref={trackRef}>
        {slides.map((slide) => (
          <div key={slide.id} className="carousel-manual-slide">
            <p className="carousel-manual-slide-num">{slide.number}</p>
            <h3 className="carousel-manual-slide-title">{slide.title}</h3>
            <p className="carousel-manual-slide-text">{slide.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
