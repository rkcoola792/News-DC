import {
  Layers,
  House,
  TrendingUp,
  LayoutGrid,
  Bookmark,
  Sparkles,
  Search,
  Moon,
  Sun,
  ArrowLeft,
  Send,
  Building2,
  Cpu,
  Zap,
  Snowflake,
  Leaf,
  Network,
  Shield,
  ChartNoAxesCombined,
  FileText,
  Play,
  FlaskConical,
  MessagesSquare,
  History,
} from 'lucide-react';
export const topics = [
  ['Infrastructure', Building2],
  ['AI Compute & GPUs', Cpu],
  ['Power & Energy', Zap],
  ['Cooling', Snowflake],
  ['Sustainability', Leaf],
  ['Hyperscalers', Layers],
  ['Networking', Network],
  ['Security', Shield],
];
export const items = [
  {
    id: 'ai-infrastructure',
    title: 'How AI infrastructure is reshaping modern data centers',
    topic: 'AI Compute & GPUs',
    type: 'Article',
    summary:
      'Explore the infrastructure questions behind AI workloads: compute density, power availability, and cooling design.',
    art: 'racks',
  },
  {
    id: 'liquid-cooling',
    title: 'Liquid cooling explained for high-density servers',
    topic: 'Cooling',
    type: 'Video',
    summary:
      'A preview of technical talks on cooling high-performance computing. Summaries require an available transcript.',
    art: 'cooling',
  },
  {
    id: 'energy-efficiency',
    title: 'Understanding energy efficiency in hyperscale facilities',
    topic: 'Sustainability',
    type: 'Research',
    summary:
      'Discover research on energy efficiency, resource use, and the tradeoffs involved in operating large facilities.',
    art: 'green',
  },
  {
    id: 'power-capacity',
    title: 'Planning power capacity for the next generation of compute',
    topic: 'Power & Energy',
    type: 'Article',
    summary: 'An introduction to electricity supply, site planning, and growing compute demand.',
    art: 'power',
  },
  {
    id: 'network-design',
    title: 'What changes when a network is designed for AI workloads?',
    topic: 'Networking',
    type: 'Discussion',
    summary:
      'Explore engineering conversations about interconnects, network architecture, and infrastructure bottlenecks.',
    art: 'racks',
  },
];
export const nav = [
  ['/', 'For You', House],
  ['/trending', 'Trending', TrendingUp],
  ['/topics', 'Topics', LayoutGrid],
  ['/saved', 'Saved', Bookmark],
  ['/ask', 'Ask AI', Sparkles],
];
