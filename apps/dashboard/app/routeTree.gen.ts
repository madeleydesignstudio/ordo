/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from "./routes/__root";
import { Route as SigninImport } from "./routes/signin";
import { Route as SettingsImport } from "./routes/settings";
import { Route as JournalImport } from "./routes/journal";
import { Route as FitnessTrackerImport } from "./routes/fitness-tracker";
import { Route as IndexImport } from "./routes/index";
import { Route as ProjectManagerIndexImport } from "./routes/project-manager/index";
import { Route as FinanceManagerIndexImport } from "./routes/finance-manager/index";
import { Route as ContentManagerIndexImport } from "./routes/content-manager/index";
import { Route as ProjectManagerTasksImport } from "./routes/project-manager/tasks";
import { Route as ProjectManagerProjectsImport } from "./routes/project-manager/projects";
import { Route as ProjectManagerNotesImport } from "./routes/project-manager/notes";
import { Route as ProjectManagerNotebooksImport } from "./routes/project-manager/notebooks";
import { Route as ProjectManagerMyIssuesImport } from "./routes/project-manager/my-issues";
import { Route as ProjectManagerInboxImport } from "./routes/project-manager/inbox";
import { Route as ProjectManagerCanvasImport } from "./routes/project-manager/canvas";
import { Route as ProjectManagerProjectSlugImport } from "./routes/project-manager/$projectSlug";
import { Route as ContentManagerPeopleImport } from "./routes/content-manager/people";
import { Route as ContentManagerOpportunitiesImport } from "./routes/content-manager/opportunities";
import { Route as ContentManagerEmailImport } from "./routes/content-manager/email";
import { Route as ContentManagerCompaniesImport } from "./routes/content-manager/companies";
import { Route as ContentManagerBulkUnsubscribeImport } from "./routes/content-manager/bulk-unsubscribe";

// Create/Update Routes

const SigninRoute = SigninImport.update({
  id: "/signin",
  path: "/signin",
  getParentRoute: () => rootRoute,
} as any);

const SettingsRoute = SettingsImport.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => rootRoute,
} as any);

const JournalRoute = JournalImport.update({
  id: "/journal",
  path: "/journal",
  getParentRoute: () => rootRoute,
} as any);

const FitnessTrackerRoute = FitnessTrackerImport.update({
  id: "/fitness-tracker",
  path: "/fitness-tracker",
  getParentRoute: () => rootRoute,
} as any);

const IndexRoute = IndexImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => rootRoute,
} as any);

const ProjectManagerIndexRoute = ProjectManagerIndexImport.update({
  id: "/project-manager/",
  path: "/project-manager/",
  getParentRoute: () => rootRoute,
} as any);

const FinanceManagerIndexRoute = FinanceManagerIndexImport.update({
  id: "/finance-manager/",
  path: "/finance-manager/",
  getParentRoute: () => rootRoute,
} as any);

const ContentManagerIndexRoute = ContentManagerIndexImport.update({
  id: "/content-manager/",
  path: "/content-manager/",
  getParentRoute: () => rootRoute,
} as any);

const ProjectManagerTasksRoute = ProjectManagerTasksImport.update({
  id: "/project-manager/tasks",
  path: "/project-manager/tasks",
  getParentRoute: () => rootRoute,
} as any);

const ProjectManagerProjectsRoute = ProjectManagerProjectsImport.update({
  id: "/project-manager/projects",
  path: "/project-manager/projects",
  getParentRoute: () => rootRoute,
} as any);

const ProjectManagerNotesRoute = ProjectManagerNotesImport.update({
  id: "/project-manager/notes",
  path: "/project-manager/notes",
  getParentRoute: () => rootRoute,
} as any);

const ProjectManagerNotebooksRoute = ProjectManagerNotebooksImport.update({
  id: "/project-manager/notebooks",
  path: "/project-manager/notebooks",
  getParentRoute: () => rootRoute,
} as any);

const ProjectManagerMyIssuesRoute = ProjectManagerMyIssuesImport.update({
  id: "/project-manager/my-issues",
  path: "/project-manager/my-issues",
  getParentRoute: () => rootRoute,
} as any);

const ProjectManagerInboxRoute = ProjectManagerInboxImport.update({
  id: "/project-manager/inbox",
  path: "/project-manager/inbox",
  getParentRoute: () => rootRoute,
} as any);

const ProjectManagerCanvasRoute = ProjectManagerCanvasImport.update({
  id: "/project-manager/canvas",
  path: "/project-manager/canvas",
  getParentRoute: () => rootRoute,
} as any);

const ProjectManagerProjectSlugRoute = ProjectManagerProjectSlugImport.update({
  id: "/project-manager/$projectSlug",
  path: "/project-manager/$projectSlug",
  getParentRoute: () => rootRoute,
} as any);

const ContentManagerPeopleRoute = ContentManagerPeopleImport.update({
  id: "/content-manager/people",
  path: "/content-manager/people",
  getParentRoute: () => rootRoute,
} as any);

const ContentManagerOpportunitiesRoute =
  ContentManagerOpportunitiesImport.update({
    id: "/content-manager/opportunities",
    path: "/content-manager/opportunities",
    getParentRoute: () => rootRoute,
  } as any);

const ContentManagerEmailRoute = ContentManagerEmailImport.update({
  id: "/content-manager/email",
  path: "/content-manager/email",
  getParentRoute: () => rootRoute,
} as any);

const ContentManagerCompaniesRoute = ContentManagerCompaniesImport.update({
  id: "/content-manager/companies",
  path: "/content-manager/companies",
  getParentRoute: () => rootRoute,
} as any);

const ContentManagerBulkUnsubscribeRoute =
  ContentManagerBulkUnsubscribeImport.update({
    id: "/content-manager/bulk-unsubscribe",
    path: "/content-manager/bulk-unsubscribe",
    getParentRoute: () => rootRoute,
  } as any);

// Populate the FileRoutesByPath interface

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/": {
      id: "/";
      path: "/";
      fullPath: "/";
      preLoaderRoute: typeof IndexImport;
      parentRoute: typeof rootRoute;
    };
    "/fitness-tracker": {
      id: "/fitness-tracker";
      path: "/fitness-tracker";
      fullPath: "/fitness-tracker";
      preLoaderRoute: typeof FitnessTrackerImport;
      parentRoute: typeof rootRoute;
    };
    "/journal": {
      id: "/journal";
      path: "/journal";
      fullPath: "/journal";
      preLoaderRoute: typeof JournalImport;
      parentRoute: typeof rootRoute;
    };
    "/settings": {
      id: "/settings";
      path: "/settings";
      fullPath: "/settings";
      preLoaderRoute: typeof SettingsImport;
      parentRoute: typeof rootRoute;
    };
    "/signin": {
      id: "/signin";
      path: "/signin";
      fullPath: "/signin";
      preLoaderRoute: typeof SigninImport;
      parentRoute: typeof rootRoute;
    };
    "/content-manager/bulk-unsubscribe": {
      id: "/content-manager/bulk-unsubscribe";
      path: "/content-manager/bulk-unsubscribe";
      fullPath: "/content-manager/bulk-unsubscribe";
      preLoaderRoute: typeof ContentManagerBulkUnsubscribeImport;
      parentRoute: typeof rootRoute;
    };
    "/content-manager/companies": {
      id: "/content-manager/companies";
      path: "/content-manager/companies";
      fullPath: "/content-manager/companies";
      preLoaderRoute: typeof ContentManagerCompaniesImport;
      parentRoute: typeof rootRoute;
    };
    "/content-manager/email": {
      id: "/content-manager/email";
      path: "/content-manager/email";
      fullPath: "/content-manager/email";
      preLoaderRoute: typeof ContentManagerEmailImport;
      parentRoute: typeof rootRoute;
    };
    "/content-manager/opportunities": {
      id: "/content-manager/opportunities";
      path: "/content-manager/opportunities";
      fullPath: "/content-manager/opportunities";
      preLoaderRoute: typeof ContentManagerOpportunitiesImport;
      parentRoute: typeof rootRoute;
    };
    "/content-manager/people": {
      id: "/content-manager/people";
      path: "/content-manager/people";
      fullPath: "/content-manager/people";
      preLoaderRoute: typeof ContentManagerPeopleImport;
      parentRoute: typeof rootRoute;
    };
    "/project-manager/$projectSlug": {
      id: "/project-manager/$projectSlug";
      path: "/project-manager/$projectSlug";
      fullPath: "/project-manager/$projectSlug";
      preLoaderRoute: typeof ProjectManagerProjectSlugImport;
      parentRoute: typeof rootRoute;
    };
    "/project-manager/canvas": {
      id: "/project-manager/canvas";
      path: "/project-manager/canvas";
      fullPath: "/project-manager/canvas";
      preLoaderRoute: typeof ProjectManagerCanvasImport;
      parentRoute: typeof rootRoute;
    };
    "/project-manager/inbox": {
      id: "/project-manager/inbox";
      path: "/project-manager/inbox";
      fullPath: "/project-manager/inbox";
      preLoaderRoute: typeof ProjectManagerInboxImport;
      parentRoute: typeof rootRoute;
    };
    "/project-manager/my-issues": {
      id: "/project-manager/my-issues";
      path: "/project-manager/my-issues";
      fullPath: "/project-manager/my-issues";
      preLoaderRoute: typeof ProjectManagerMyIssuesImport;
      parentRoute: typeof rootRoute;
    };
    "/project-manager/notebooks": {
      id: "/project-manager/notebooks";
      path: "/project-manager/notebooks";
      fullPath: "/project-manager/notebooks";
      preLoaderRoute: typeof ProjectManagerNotebooksImport;
      parentRoute: typeof rootRoute;
    };
    "/project-manager/notes": {
      id: "/project-manager/notes";
      path: "/project-manager/notes";
      fullPath: "/project-manager/notes";
      preLoaderRoute: typeof ProjectManagerNotesImport;
      parentRoute: typeof rootRoute;
    };
    "/project-manager/projects": {
      id: "/project-manager/projects";
      path: "/project-manager/projects";
      fullPath: "/project-manager/projects";
      preLoaderRoute: typeof ProjectManagerProjectsImport;
      parentRoute: typeof rootRoute;
    };
    "/project-manager/tasks": {
      id: "/project-manager/tasks";
      path: "/project-manager/tasks";
      fullPath: "/project-manager/tasks";
      preLoaderRoute: typeof ProjectManagerTasksImport;
      parentRoute: typeof rootRoute;
    };
    "/content-manager/": {
      id: "/content-manager/";
      path: "/content-manager";
      fullPath: "/content-manager";
      preLoaderRoute: typeof ContentManagerIndexImport;
      parentRoute: typeof rootRoute;
    };
    "/finance-manager/": {
      id: "/finance-manager/";
      path: "/finance-manager";
      fullPath: "/finance-manager";
      preLoaderRoute: typeof FinanceManagerIndexImport;
      parentRoute: typeof rootRoute;
    };
    "/project-manager/": {
      id: "/project-manager/";
      path: "/project-manager";
      fullPath: "/project-manager";
      preLoaderRoute: typeof ProjectManagerIndexImport;
      parentRoute: typeof rootRoute;
    };
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  "/": typeof IndexRoute;
  "/fitness-tracker": typeof FitnessTrackerRoute;
  "/journal": typeof JournalRoute;
  "/settings": typeof SettingsRoute;
  "/signin": typeof SigninRoute;
  "/content-manager/bulk-unsubscribe": typeof ContentManagerBulkUnsubscribeRoute;
  "/content-manager/companies": typeof ContentManagerCompaniesRoute;
  "/content-manager/email": typeof ContentManagerEmailRoute;
  "/content-manager/opportunities": typeof ContentManagerOpportunitiesRoute;
  "/content-manager/people": typeof ContentManagerPeopleRoute;
  "/project-manager/$projectSlug": typeof ProjectManagerProjectSlugRoute;
  "/project-manager/canvas": typeof ProjectManagerCanvasRoute;
  "/project-manager/inbox": typeof ProjectManagerInboxRoute;
  "/project-manager/my-issues": typeof ProjectManagerMyIssuesRoute;
  "/project-manager/notebooks": typeof ProjectManagerNotebooksRoute;
  "/project-manager/notes": typeof ProjectManagerNotesRoute;
  "/project-manager/projects": typeof ProjectManagerProjectsRoute;
  "/project-manager/tasks": typeof ProjectManagerTasksRoute;
  "/content-manager": typeof ContentManagerIndexRoute;
  "/finance-manager": typeof FinanceManagerIndexRoute;
  "/project-manager": typeof ProjectManagerIndexRoute;
}

export interface FileRoutesByTo {
  "/": typeof IndexRoute;
  "/fitness-tracker": typeof FitnessTrackerRoute;
  "/journal": typeof JournalRoute;
  "/settings": typeof SettingsRoute;
  "/signin": typeof SigninRoute;
  "/content-manager/bulk-unsubscribe": typeof ContentManagerBulkUnsubscribeRoute;
  "/content-manager/companies": typeof ContentManagerCompaniesRoute;
  "/content-manager/email": typeof ContentManagerEmailRoute;
  "/content-manager/opportunities": typeof ContentManagerOpportunitiesRoute;
  "/content-manager/people": typeof ContentManagerPeopleRoute;
  "/project-manager/$projectSlug": typeof ProjectManagerProjectSlugRoute;
  "/project-manager/canvas": typeof ProjectManagerCanvasRoute;
  "/project-manager/inbox": typeof ProjectManagerInboxRoute;
  "/project-manager/my-issues": typeof ProjectManagerMyIssuesRoute;
  "/project-manager/notebooks": typeof ProjectManagerNotebooksRoute;
  "/project-manager/notes": typeof ProjectManagerNotesRoute;
  "/project-manager/projects": typeof ProjectManagerProjectsRoute;
  "/project-manager/tasks": typeof ProjectManagerTasksRoute;
  "/content-manager": typeof ContentManagerIndexRoute;
  "/finance-manager": typeof FinanceManagerIndexRoute;
  "/project-manager": typeof ProjectManagerIndexRoute;
}

export interface FileRoutesById {
  __root__: typeof rootRoute;
  "/": typeof IndexRoute;
  "/fitness-tracker": typeof FitnessTrackerRoute;
  "/journal": typeof JournalRoute;
  "/settings": typeof SettingsRoute;
  "/signin": typeof SigninRoute;
  "/content-manager/bulk-unsubscribe": typeof ContentManagerBulkUnsubscribeRoute;
  "/content-manager/companies": typeof ContentManagerCompaniesRoute;
  "/content-manager/email": typeof ContentManagerEmailRoute;
  "/content-manager/opportunities": typeof ContentManagerOpportunitiesRoute;
  "/content-manager/people": typeof ContentManagerPeopleRoute;
  "/project-manager/$projectSlug": typeof ProjectManagerProjectSlugRoute;
  "/project-manager/canvas": typeof ProjectManagerCanvasRoute;
  "/project-manager/inbox": typeof ProjectManagerInboxRoute;
  "/project-manager/my-issues": typeof ProjectManagerMyIssuesRoute;
  "/project-manager/notebooks": typeof ProjectManagerNotebooksRoute;
  "/project-manager/notes": typeof ProjectManagerNotesRoute;
  "/project-manager/projects": typeof ProjectManagerProjectsRoute;
  "/project-manager/tasks": typeof ProjectManagerTasksRoute;
  "/content-manager/": typeof ContentManagerIndexRoute;
  "/finance-manager/": typeof FinanceManagerIndexRoute;
  "/project-manager/": typeof ProjectManagerIndexRoute;
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath;
  fullPaths:
    | "/"
    | "/fitness-tracker"
    | "/journal"
    | "/settings"
    | "/signin"
    | "/content-manager/bulk-unsubscribe"
    | "/content-manager/companies"
    | "/content-manager/email"
    | "/content-manager/opportunities"
    | "/content-manager/people"
    | "/project-manager/$projectSlug"
    | "/project-manager/canvas"
    | "/project-manager/inbox"
    | "/project-manager/my-issues"
    | "/project-manager/notebooks"
    | "/project-manager/notes"
    | "/project-manager/projects"
    | "/project-manager/tasks"
    | "/content-manager"
    | "/finance-manager"
    | "/project-manager";
  fileRoutesByTo: FileRoutesByTo;
  to:
    | "/"
    | "/fitness-tracker"
    | "/journal"
    | "/settings"
    | "/signin"
    | "/content-manager/bulk-unsubscribe"
    | "/content-manager/companies"
    | "/content-manager/email"
    | "/content-manager/opportunities"
    | "/content-manager/people"
    | "/project-manager/$projectSlug"
    | "/project-manager/canvas"
    | "/project-manager/inbox"
    | "/project-manager/my-issues"
    | "/project-manager/notebooks"
    | "/project-manager/notes"
    | "/project-manager/projects"
    | "/project-manager/tasks"
    | "/content-manager"
    | "/finance-manager"
    | "/project-manager";
  id:
    | "__root__"
    | "/"
    | "/fitness-tracker"
    | "/journal"
    | "/settings"
    | "/signin"
    | "/content-manager/bulk-unsubscribe"
    | "/content-manager/companies"
    | "/content-manager/email"
    | "/content-manager/opportunities"
    | "/content-manager/people"
    | "/project-manager/$projectSlug"
    | "/project-manager/canvas"
    | "/project-manager/inbox"
    | "/project-manager/my-issues"
    | "/project-manager/notebooks"
    | "/project-manager/notes"
    | "/project-manager/projects"
    | "/project-manager/tasks"
    | "/content-manager/"
    | "/finance-manager/"
    | "/project-manager/";
  fileRoutesById: FileRoutesById;
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute;
  FitnessTrackerRoute: typeof FitnessTrackerRoute;
  JournalRoute: typeof JournalRoute;
  SettingsRoute: typeof SettingsRoute;
  SigninRoute: typeof SigninRoute;
  ContentManagerBulkUnsubscribeRoute: typeof ContentManagerBulkUnsubscribeRoute;
  ContentManagerCompaniesRoute: typeof ContentManagerCompaniesRoute;
  ContentManagerEmailRoute: typeof ContentManagerEmailRoute;
  ContentManagerOpportunitiesRoute: typeof ContentManagerOpportunitiesRoute;
  ContentManagerPeopleRoute: typeof ContentManagerPeopleRoute;
  ProjectManagerProjectSlugRoute: typeof ProjectManagerProjectSlugRoute;
  ProjectManagerCanvasRoute: typeof ProjectManagerCanvasRoute;
  ProjectManagerInboxRoute: typeof ProjectManagerInboxRoute;
  ProjectManagerMyIssuesRoute: typeof ProjectManagerMyIssuesRoute;
  ProjectManagerNotebooksRoute: typeof ProjectManagerNotebooksRoute;
  ProjectManagerNotesRoute: typeof ProjectManagerNotesRoute;
  ProjectManagerProjectsRoute: typeof ProjectManagerProjectsRoute;
  ProjectManagerTasksRoute: typeof ProjectManagerTasksRoute;
  ContentManagerIndexRoute: typeof ContentManagerIndexRoute;
  FinanceManagerIndexRoute: typeof FinanceManagerIndexRoute;
  ProjectManagerIndexRoute: typeof ProjectManagerIndexRoute;
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  FitnessTrackerRoute: FitnessTrackerRoute,
  JournalRoute: JournalRoute,
  SettingsRoute: SettingsRoute,
  SigninRoute: SigninRoute,
  ContentManagerBulkUnsubscribeRoute: ContentManagerBulkUnsubscribeRoute,
  ContentManagerCompaniesRoute: ContentManagerCompaniesRoute,
  ContentManagerEmailRoute: ContentManagerEmailRoute,
  ContentManagerOpportunitiesRoute: ContentManagerOpportunitiesRoute,
  ContentManagerPeopleRoute: ContentManagerPeopleRoute,
  ProjectManagerProjectSlugRoute: ProjectManagerProjectSlugRoute,
  ProjectManagerCanvasRoute: ProjectManagerCanvasRoute,
  ProjectManagerInboxRoute: ProjectManagerInboxRoute,
  ProjectManagerMyIssuesRoute: ProjectManagerMyIssuesRoute,
  ProjectManagerNotebooksRoute: ProjectManagerNotebooksRoute,
  ProjectManagerNotesRoute: ProjectManagerNotesRoute,
  ProjectManagerProjectsRoute: ProjectManagerProjectsRoute,
  ProjectManagerTasksRoute: ProjectManagerTasksRoute,
  ContentManagerIndexRoute: ContentManagerIndexRoute,
  FinanceManagerIndexRoute: FinanceManagerIndexRoute,
  ProjectManagerIndexRoute: ProjectManagerIndexRoute,
};

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>();

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/fitness-tracker",
        "/journal",
        "/settings",
        "/signin",
        "/content-manager/bulk-unsubscribe",
        "/content-manager/companies",
        "/content-manager/email",
        "/content-manager/opportunities",
        "/content-manager/people",
        "/project-manager/$projectSlug",
        "/project-manager/canvas",
        "/project-manager/inbox",
        "/project-manager/my-issues",
        "/project-manager/notebooks",
        "/project-manager/notes",
        "/project-manager/projects",
        "/project-manager/tasks",
        "/content-manager/",
        "/finance-manager/",
        "/project-manager/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/fitness-tracker": {
      "filePath": "fitness-tracker.tsx"
    },
    "/journal": {
      "filePath": "journal.tsx"
    },
    "/settings": {
      "filePath": "settings.tsx"
    },
    "/signin": {
      "filePath": "signin.tsx"
    },
    "/content-manager/bulk-unsubscribe": {
      "filePath": "content-manager/bulk-unsubscribe.tsx"
    },
    "/content-manager/companies": {
      "filePath": "content-manager/companies.tsx"
    },
    "/content-manager/email": {
      "filePath": "content-manager/email.tsx"
    },
    "/content-manager/opportunities": {
      "filePath": "content-manager/opportunities.tsx"
    },
    "/content-manager/people": {
      "filePath": "content-manager/people.tsx"
    },
    "/project-manager/$projectSlug": {
      "filePath": "project-manager/$projectSlug.tsx"
    },
    "/project-manager/canvas": {
      "filePath": "project-manager/canvas.tsx"
    },
    "/project-manager/inbox": {
      "filePath": "project-manager/inbox.tsx"
    },
    "/project-manager/my-issues": {
      "filePath": "project-manager/my-issues.tsx"
    },
    "/project-manager/notebooks": {
      "filePath": "project-manager/notebooks.tsx"
    },
    "/project-manager/notes": {
      "filePath": "project-manager/notes.tsx"
    },
    "/project-manager/projects": {
      "filePath": "project-manager/projects.tsx"
    },
    "/project-manager/tasks": {
      "filePath": "project-manager/tasks.tsx"
    },
    "/content-manager/": {
      "filePath": "content-manager/index.tsx"
    },
    "/finance-manager/": {
      "filePath": "finance-manager/index.tsx"
    },
    "/project-manager/": {
      "filePath": "project-manager/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
