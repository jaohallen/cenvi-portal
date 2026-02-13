import ProjectCard from "../components/ProjectCard";
import { projects } from "../data/projects";

const ProjectDetails = () => {
  return (
    <section className="w-full py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-[#344e41] mt-10 mb-10 text-center tracking-tight relative">
          <span className="relative inline-block after:content-[''] after:block after:w-24 after:h-1 after:bg-[#3a5a40] after:mx-auto after:mt-2">
            Research Projects
          </span>
        </h2>

        <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto mb-16">
          Explore CENVI’s funded research initiatives in environmental informatics,
          disaster risk reduction, geospatial analytics, and climate adaptation.
        </p>

        {/* List Layout */}
        <div className="space-y-12">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col md:flex-col lg:flex-row items-center lg:items-start text-center lg:text-left gap-8 border-b pb-10"
            >

              {/* Left: Logo */}
              <div className="w-28 h-28 flex-shrink-0 mx-auto lg:mx-0">
                <img
                  src={project.logo}
                  alt={project.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Right: Title + Description */}
              <div>
                <h3 className="text-2xl font-semibold text-[#344e41] mb-3">
                  {project.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Contact CTA */}
    <div className="mt-20 text-center">
      <p className="text-lg text-gray-700">
        To know more or inquire about the outputs and datasets, please contact CENVI.
      </p>
    </div>

    </section>
  );
};

export default ProjectDetails;
