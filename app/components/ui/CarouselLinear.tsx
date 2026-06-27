interface CarouselLinearProps {
  items: string[];
  theme?: "on-dark" | "on-light";
  speed?: number;
}

export default function CarouselLinear({ items, theme = "on-light", speed = 32 }: CarouselLinearProps) {
  const doubled = [...items, ...items];
  const themeClass = theme === "on-dark" ? "carousel-linear--on-dark" : "carousel-linear--on-light";

  return (
    <div className={`carousel-linear ${themeClass}`}>
      <div
        className="carousel-linear-track"
        style={{ animationDuration: `${speed}s` }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="carousel-linear-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
