import type { WebService } from "~/types";

interface ServiceCardProps {
  service: WebService;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="service-card">
      <div className="service-card-thumb">
        {/* TODO: reemplazar por imagen real */}
      </div>
      <div>
        <h3 className="service-card-title">{service.title}</h3>
        <p className="service-card-desc">{service.description}</p>
      </div>
    </article>
  );
}
