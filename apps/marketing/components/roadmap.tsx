"use client";

interface RoadmapItem {
  title: string;
  description: string;
  status: "in-progress" | "planned";
}

const roadmapItems: RoadmapItem[] = [
  {
    title: "unified workspace",
    description: "centralized hub for all your tools and workflows",
    status: "in-progress",
  },
  {
    title: "smart automation",
    description: "AI-powered task management and scheduling",
    status: "in-progress",
  },
  {
    title: "team collaboration",
    description: "real-time collaboration and project management",
    status: "planned",
  },
  {
    title: "advanced integrations",
    description: "connect with 200+ popular productivity tools",
    status: "planned",
  },
];

export function Roadmap() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg sm:text-xl font-medium border-l-4 border-blue-500 pl-4">
        roadmap
      </h2>

      <div className="space-y-4">
        {roadmapItems.map((item, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 animate-in slide-in-from-right duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 transition-colors ${
                item.status === "in-progress"
                  ? "bg-blue-500 animate-pulse"
                  : "bg-gray-300"
              }`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                {item.description}
              </p>
              <p
                className={`text-xs mt-1 ${
                  item.status === "in-progress"
                    ? "text-blue-600 font-medium"
                    : "text-gray-500"
                }`}
              >
                {item.status === "in-progress" ? "in progress" : "planned"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
