import type { ProjectCase } from "~/types";
import ButtonSlider from "./ButtonSlider";
import { toPrettyIdUrl } from "~/lib/slugify";
import "~/styles/ProjectCard.css";

interface ProjectCardProps {
  project: ProjectCase;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const orderLabel = String(project.order).padStart(2, "0");

  return (
    <article className="project-card">
      <div className="project-card-image">
        <span className="project-card-num">{orderLabel}</span>
        <img
          src={project.media[0]?.url_externa ?? ""}
          alt={project.media[0]?.alt_text ?? project.title}
          className="project-card-img"
        />
      </div>
      <div className="project-card-body">
        <p className="project-card-client">{project.client}</p>
        <h3 className="project-card-title">{project.title}</h3>
        <p className="project-card-desc">{project.description}</p>

        {project.tags.length > 0 && (
          <ul className="project-card-tags">
            {project.tags.map((tag) => (
              <li key={tag} className="project-tag">
                {tag}
              </li>
            ))}
          </ul>
        )}

        {project.resultados.length > 0 && (
          <div className="project-card-result">
            <p className="project-card-result-label">Resultados</p>
            <ul className="project-card-result-list">
              {project.resultados.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="project-card-btn">
          <ButtonSlider text="VER PROYECTO" to={`/proyectos/${toPrettyIdUrl(project.title, project.id)}`} />
        </div>
      </div>
    </article>
  );
}
