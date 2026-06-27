import type { ProjectCase } from "~/types";

interface ProjectCardProps {
  project: ProjectCase;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const orderLabel = String(project.order).padStart(2, "0");

  return (
    <article className="project-card">
      <div className="project-card-image">
        <span className="project-card-num">{orderLabel}</span>
        {/* TODO: reemplazar por imagen real */}
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

        {project.result && (
          <div className="project-card-result">
            <p className="project-card-result-label">Resultado</p>
            <p className="project-card-result-text">{project.result}</p>
          </div>
        )}
      </div>
    </article>
  );
}
