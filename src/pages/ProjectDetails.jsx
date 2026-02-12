import ProjectCard from "../components/ProjectCard";
import { projects } from "../data/projects";

const ProjectDetails = () => {
  return (
    <section
      className="w-full py-20"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-[#344e41] mt-10 mb-10 text-center tracking-tight relative">
            <span className="relative inline-block after:content-[''] after:block after:w-24 after:h-1 after:bg-[#3a5a40] after:mx-auto after:mt-2">
                Research Projects
            </span>
        </h2>

        <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto mb-16">
          Explore CENVI’s funded research initiatives in environmental informatics,
          disaster risk reduction, geospatial analytics, and climate adaptation.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              logo={project.logo}
              title={project.title}
              description={project.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectDetails;
