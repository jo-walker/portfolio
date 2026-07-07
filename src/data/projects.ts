export interface Project {
  id: string;
  name: string;
  icon: string;
  category: 'creative' | 'professional';
  tagline: string;
  stack: string[];
  highlights: string[];
  href?: string; // omit when there's no public repo/demo yet
}

export const projects: Project[] = [
  {
    id: 'parkopticon',
    name: 'Parkopticon',
    icon: '🅿️',
    category: 'creative',
    tagline: 'Find parking, avoid tickets — crowdsourced, real-time.',
    stack: ['React Native', 'Expo', 'Edge AI', 'mmWave radar'],
    highlights: [
      'Cross-platform mobile app for real-time street-parking and enforcement alerts, driven by community reports.',
      'Designed toward an edge-inference vehicle sentinel using mmWave radar and distributed IoT nodes under strict low-power constraints.',
    ],
  },
  {
    id: 'raindropticon',
    name: 'Raindropticon',
    icon: '🌧️',
    category: 'creative',
    tagline: 'Production-grade workforce management for cleaning ops.',
    stack: ['NestJS', 'GraphQL', 'PostgreSQL/PostGIS', 'Prisma', 'React 19', 'React Native', 'Docker'],
    highlights: [
      'Monorepo: geospatial NestJS/GraphQL backend, React 19 ops dashboard, and a React Native field app — fully containerized.',
      'Sub-meter geofence validation with raw PostGIS queries prevents false clock-ins; end-to-end type safety via code-first GraphQL.',
    ],
  },
  {
    id: 'put-it-down',
    name: 'Put It Down',
    icon: '📱',
    category: 'creative',
    tagline: 'A focus monitor that notices when you pick up your phone.',
    stack: ['Python', 'OpenCV', 'MediaPipe', 'Tkinter'],
    highlights: [
      'Desktop app combining app-usage tracking with webcam head-pose estimation to infer focus vs. distraction.',
      'Classifies head pose (screen / phone / limbo / away) from facial landmark depth and tracks time per state.',
    ],
  },
  {
    id: 'note-splicer',
    name: 'note-splicer',
    icon: '🗒️',
    category: 'creative',
    tagline: 'Turn messy notes into a searchable RAG knowledge base.',
    stack: ['Python', 'ChromaDB', 'litellm', 'RAG'],
    highlights: [
      'Pipeline that structures raw text notes with generative AI and indexes them into a persistent vector database.',
      'Retrieval-augmented generation answers questions grounded in your own notes.',
    ],
  },
  {
    id: 'inventory',
    name: 'Inventory Management System',
    icon: '📦',
    category: 'professional',
    tagline: 'Transaction-based stock with barcode + vendor financials.',
    stack: ['React', 'TypeScript', 'Node.js', 'Express', 'MySQL', 'Sequelize'],
    highlights: [
      'Stock derived from invoice receipts minus sales — eliminating quantity drift from manual edits.',
      'CODE128 barcode generation with thermal label printing, vendor payment allocation, and landed-cost analysis.',
      'Bulk CSV/Excel import with confidence-scored fuzzy column matching, plus a custom report builder.',
    ],
  },
  {
    id: 'pm-repo',
    name: 'Project Management API',
    icon: '🗂️',
    category: 'professional',
    tagline: '25+ endpoint REST API with JWT auth and tuned queries.',
    stack: ['Java', 'JAX-RS', 'Hibernate', 'PostgreSQL'],
    highlights: [
      'JWT auth with refresh-token rotation and role-based access (Admin / PM / Client).',
      'Composite indexes cut dashboard load from 3.2s to 0.8s for users with 1000+ tasks; 85% test coverage.',
    ],
  },
  {
    id: 'med-ed',
    name: 'Medical Education School Mgmt',
    icon: '🏥',
    category: 'professional',
    tagline: '76-endpoint Java EE API with 100% test coverage.',
    stack: ['Java EE', 'JPA', 'Maven', 'JUnit'],
    highlights: [
      'RESTful API spanning 8 resource domains managing 1000+ records.',
      '100% code coverage via JUnit and Maven Surefire in a Linux CI environment.',
    ],
  },
  {
    id: 'pos',
    name: 'E-commerce POS System',
    icon: '🧾',
    category: 'professional',
    tagline: 'Back-office POS with full-text-tuned catalog search.',
    stack: ['Angular', 'Node.js', 'MySQL'],
    highlights: [
      'Point-of-sale with inventory management and sales reporting for a retail business.',
      'MySQL full-text indexes on product names/descriptions cut average page load by 75%.',
    ],
  },
];
