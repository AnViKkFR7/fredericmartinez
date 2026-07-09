import type { WebService } from "~/types";
import ButtonSlider from "./ButtonSlider";

interface ServiceCardProps {
  service: WebService;
}

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" width="12" height="12">
    <path d="M13.0457 8.13128L5.8733 15.3037L4.69479 14.1252L11.8672 6.95277L5.54568 6.95277L5.54568 5.28636H14.7121V14.4528L13.0457 14.4528V8.13128Z" fill="currentColor" />
  </svg>
);

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="service-card">
      <div className="service-card-thumb-wrapper">
        <div className="service-card-thumb">
          <h3 className="service-card-title">{service.title}</h3>
          <img src="/public/images/proyectos3.png" alt={service.description} className="service-card-thumb-img" />
        </div>
        <div>
          <p className="service-card-desc">QUÉ   SÉ   HACER:</p>
        </div>
        <div className="service-card-content">

          <ul className="service-card-list">
            {service.que_se_hacer.map((skill, index) => (
              <li key={index} className="service-card-list-item">
                <div className="btn-arrow__circle service-card-list-item-icon">
                  <ArrowIcon />
                </div>
                <p className="service-card-list-item-text">{skill}</p>
              </li>
            ))}
          </ul>

        </div>
      </div>

      <div className="service-card-btn">
        <ButtonSlider text="VER EJEMPLOS" onClick={() => { }} />
      </div>
      
    </article>
  );
}
