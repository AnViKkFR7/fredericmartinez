interface CarouselCircularProps {
  text?: string;
  size?: number;
  color?: string;
  speed?: number;
}

export default function CarouselCircular({
  text = "DISPONIBLE · DISPONIBLE · DISPONIBLE ·",
  size = 160,
  color = "#000000",
  speed = 14,
}: CarouselCircularProps) {
  const radius = size / 2 - 16;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="carousel-circular" style={{ width: size, height: size }}>
      <svg
        className="carousel-circular-svg"
        viewBox={`0 0 ${size} ${size}`}
        style={{ animationDuration: `${speed}s` }}
      >
        <defs>
          <path
            id="circle-path"
            d={`M ${size / 2}, ${size / 2} m -${radius}, 0 a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 -${radius * 2},0`}
          />
        </defs>
        <text
          fill={color}
          fontSize="9"
          fontFamily="var(--font-mono)"
          letterSpacing="2"
          textLength={circumference}
          lengthAdjust="spacing"
        >
          <textPath href="#circle-path">{text}</textPath>
        </text>
      </svg>
      <div className="carousel-circular-center">
        <span className="carousel-circular-dot" />
      </div>
    </div>
  );
}
