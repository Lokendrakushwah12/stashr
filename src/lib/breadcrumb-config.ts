/**
 * Breadcrumb Configuration
 * Defines the route structure and labels for breadcrumb navigation
 */

export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

export interface RouteConfig {
  pattern: RegExp;
  getSegments: (pathname: string, params?: Record<string, string>, dynamicData?: Record<string, unknown>) => BreadcrumbSegment[];
}

/**
 * Route configurations for breadcrumb generation
 * Add new routes here to automatically generate breadcrumbs
 */
export const routeConfigs: RouteConfig[] = [
  // Board home page
  {
    pattern: /^\/board$/,
    getSegments: () => [{ label: "All Boards" }],
  },
  
  // All Bookmarks page
  {
    pattern: /^\/bookmarks$/,
    getSegments: () => [{ label: "All Bookmarks" }],
  },
  
  // Bookmark folder detail page (dynamic)
  {
    pattern: /^\/bookmarks\/[^/]+$/,
    getSegments: (_pathname, _params, dynamicData) => [
      { label: "All Bookmarks", href: "/bookmarks" },
      { label: dynamicData?.folderName as string || "Loading..." },
    ],
  },
  
  // Inbox page
  {
    pattern: /^\/inbox$/,
    getSegments: () => [{ label: "Inbox" }],
  },
  
  // Profile page
  {
    pattern: /^\/profile$/,
    getSegments: () => [
      { label: "Home", href: "/board" },
      { label: "Profile" },
    ],
  },
  
  // Board detail page (dynamic)
  {
    pattern: /^\/board\/[^/]+$/,
    getSegments: (_pathname, _params, dynamicData) => [
      { label: "All Boards", href: "/board" },
      { label: dynamicData?.boardName as string || "Loading..." },
    ],
  },
];

/**
 * Get breadcrumb segments for a given pathname
 */
export function getBreadcrumbSegments(
  pathname: string,
  params?: Record<string, string>,
  dynamicData?: Record<string, unknown>
): BreadcrumbSegment[] {
  // Find matching route configuration
  const matchedConfig = routeConfigs.find((config) => config.pattern.test(pathname));
  
  if (matchedConfig) {
    return matchedConfig.getSegments(pathname, params, dynamicData);
  }
  
  // Fallback: Generate breadcrumbs from path segments
  const segments = pathname.split("/").filter(Boolean);
  
  if (segments.length === 0) {
    return [{ label: "Home", href: "/board" }];
  }
  
  return [
    { label: "Home", href: "/board" },
    ...segments.map((segment, index) => {
      const isLast = index === segments.length - 1;
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      const href = isLast ? undefined : `/${segments.slice(0, index + 1).join("/")}`;
      
      return { label, href };
    }),
  ];
}

