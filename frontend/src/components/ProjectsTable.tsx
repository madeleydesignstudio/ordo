import { useShape } from "@electric-sql/react";
import React, { useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Project } from "../types";

// Create column helper
const columnHelper = createColumnHelper<Project>();

// Delete project function
const deleteProject = async (projectId: number): Promise<void> => {
  const response = await fetch(`http://localhost:8080/api/projects/${projectId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete project");
  }
};

// Delete button component
function DeleteButton({
  projectId,
  projectTitle,
}: {
  projectId: number;
  projectTitle: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProject(projectId);
      // Electric SQL will automatically update the UI via real-time sync
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert(`Failed to delete project: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-600">Delete {projectTitle}?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? "..." : "Yes"}
        </button>
        <button
          onClick={handleCancel}
          className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDelete}
      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors duration-200 border border-red-300"
    >
      Delete
    </button>
  );
}

// Format date helper
const formatDate = (dateString?: string | null) => {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString();
};

// Define table columns
const columns = [
  columnHelper.accessor("id", {
    header: "ID",
    cell: (info) => (
      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("title", {
    header: "Project Title",
    cell: (info) => (
      <span className="font-medium text-gray-900">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("start_date", {
    header: "Start Date",
    cell: (info) => (
      <span className="text-sm text-gray-600">
        {formatDate(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("finish_date", {
    header: "Finish Date",
    cell: (info) => (
      <span className="text-sm text-gray-600">
        {formatDate(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("created_at", {
    header: "Created",
    cell: (info) => (
      <span className="text-sm text-gray-500">
        {new Date(info.getValue()).toLocaleDateString()}
      </span>
    ),
  }),
  // Add the new Actions column
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (info) => {
      const project = info.row.original;
      return (
        <DeleteButton
          projectId={project.id}
          projectTitle={project.title}
        />
      );
    },
  }),
];

// Projects table component that uses Electric SQL's useShape
function ProjectsTable() {
  const { isLoading, data } = useShape<Project>({
    url: `http://localhost:8080/shape`,
    params: {
      table: `projects`,
    },
  });

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Loading Projects...
          </h2>
        </div>
        <div className="p-8">
          {/* Loading skeleton */}
          <div className="animate-pulse space-y-4">
            <div className="flex space-x-4">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-gray-100 rounded w-16"></div>
                <div className="h-4 bg-gray-100 rounded w-48"></div>
                <div className="h-4 bg-gray-100 rounded w-32"></div>
                <div className="h-4 bg-gray-100 rounded w-32"></div>
                <div className="h-4 bg-gray-100 rounded w-24"></div>
                <div className="h-4 bg-gray-100 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Projects ({data?.length || 0})
          </h2>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Real-time sync active
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={`hover:bg-gray-50 transition-colors duration-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-25"
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {data && data.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No projects found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No projects have been created yet. Create your first project to get started.
          </p>
        </div>
      )}
    </div>
  );
}

export default ProjectsTable;
