/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as SigninImport } from './routes/signin'
import { Route as SettingsImport } from './routes/settings'
import { Route as JournalImport } from './routes/journal'
import { Route as FitnessTrackerImport } from './routes/fitness-tracker'
import { Route as IndexImport } from './routes/index'
import { Route as ProjectManagerIndexImport } from './routes/project-manager/index'
import { Route as FinanceManagerIndexImport } from './routes/finance-manager/index'
import { Route as ContentManagerIndexImport } from './routes/content-manager/index'

// Create/Update Routes

const SigninRoute = SigninImport.update({
  id: '/signin',
  path: '/signin',
  getParentRoute: () => rootRoute,
} as any)

const SettingsRoute = SettingsImport.update({
  id: '/settings',
  path: '/settings',
  getParentRoute: () => rootRoute,
} as any)

const JournalRoute = JournalImport.update({
  id: '/journal',
  path: '/journal',
  getParentRoute: () => rootRoute,
} as any)

const FitnessTrackerRoute = FitnessTrackerImport.update({
  id: '/fitness-tracker',
  path: '/fitness-tracker',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const ProjectManagerIndexRoute = ProjectManagerIndexImport.update({
  id: '/project-manager/',
  path: '/project-manager/',
  getParentRoute: () => rootRoute,
} as any)

const FinanceManagerIndexRoute = FinanceManagerIndexImport.update({
  id: '/finance-manager/',
  path: '/finance-manager/',
  getParentRoute: () => rootRoute,
} as any)

const ContentManagerIndexRoute = ContentManagerIndexImport.update({
  id: '/content-manager/',
  path: '/content-manager/',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/fitness-tracker': {
      id: '/fitness-tracker'
      path: '/fitness-tracker'
      fullPath: '/fitness-tracker'
      preLoaderRoute: typeof FitnessTrackerImport
      parentRoute: typeof rootRoute
    }
    '/journal': {
      id: '/journal'
      path: '/journal'
      fullPath: '/journal'
      preLoaderRoute: typeof JournalImport
      parentRoute: typeof rootRoute
    }
    '/settings': {
      id: '/settings'
      path: '/settings'
      fullPath: '/settings'
      preLoaderRoute: typeof SettingsImport
      parentRoute: typeof rootRoute
    }
    '/signin': {
      id: '/signin'
      path: '/signin'
      fullPath: '/signin'
      preLoaderRoute: typeof SigninImport
      parentRoute: typeof rootRoute
    }
    '/content-manager/': {
      id: '/content-manager/'
      path: '/content-manager'
      fullPath: '/content-manager'
      preLoaderRoute: typeof ContentManagerIndexImport
      parentRoute: typeof rootRoute
    }
    '/finance-manager/': {
      id: '/finance-manager/'
      path: '/finance-manager'
      fullPath: '/finance-manager'
      preLoaderRoute: typeof FinanceManagerIndexImport
      parentRoute: typeof rootRoute
    }
    '/project-manager/': {
      id: '/project-manager/'
      path: '/project-manager'
      fullPath: '/project-manager'
      preLoaderRoute: typeof ProjectManagerIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/fitness-tracker': typeof FitnessTrackerRoute
  '/journal': typeof JournalRoute
  '/settings': typeof SettingsRoute
  '/signin': typeof SigninRoute
  '/content-manager': typeof ContentManagerIndexRoute
  '/finance-manager': typeof FinanceManagerIndexRoute
  '/project-manager': typeof ProjectManagerIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/fitness-tracker': typeof FitnessTrackerRoute
  '/journal': typeof JournalRoute
  '/settings': typeof SettingsRoute
  '/signin': typeof SigninRoute
  '/content-manager': typeof ContentManagerIndexRoute
  '/finance-manager': typeof FinanceManagerIndexRoute
  '/project-manager': typeof ProjectManagerIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/fitness-tracker': typeof FitnessTrackerRoute
  '/journal': typeof JournalRoute
  '/settings': typeof SettingsRoute
  '/signin': typeof SigninRoute
  '/content-manager/': typeof ContentManagerIndexRoute
  '/finance-manager/': typeof FinanceManagerIndexRoute
  '/project-manager/': typeof ProjectManagerIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/fitness-tracker'
    | '/journal'
    | '/settings'
    | '/signin'
    | '/content-manager'
    | '/finance-manager'
    | '/project-manager'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/fitness-tracker'
    | '/journal'
    | '/settings'
    | '/signin'
    | '/content-manager'
    | '/finance-manager'
    | '/project-manager'
  id:
    | '__root__'
    | '/'
    | '/fitness-tracker'
    | '/journal'
    | '/settings'
    | '/signin'
    | '/content-manager/'
    | '/finance-manager/'
    | '/project-manager/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  FitnessTrackerRoute: typeof FitnessTrackerRoute
  JournalRoute: typeof JournalRoute
  SettingsRoute: typeof SettingsRoute
  SigninRoute: typeof SigninRoute
  ContentManagerIndexRoute: typeof ContentManagerIndexRoute
  FinanceManagerIndexRoute: typeof FinanceManagerIndexRoute
  ProjectManagerIndexRoute: typeof ProjectManagerIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  FitnessTrackerRoute: FitnessTrackerRoute,
  JournalRoute: JournalRoute,
  SettingsRoute: SettingsRoute,
  SigninRoute: SigninRoute,
  ContentManagerIndexRoute: ContentManagerIndexRoute,
  FinanceManagerIndexRoute: FinanceManagerIndexRoute,
  ProjectManagerIndexRoute: ProjectManagerIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

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
