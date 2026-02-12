export default function ProjectCard({ logo, title, description }) {
  return (
    <div className="bg-white">
      <div className="flex justify-center mb-4">
        <img
          src={logo}
          alt={title}
          className="h-20 object-contain"
        />
      </div>

      <h3 className="text-lg font-semibold text-center mb-2">
        {title}
      </h3>

      <p className="text-sm text-gray-600 text-center">
        {description}
      </p>
    </div>
  );
}
