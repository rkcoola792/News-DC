import { Link } from 'react-router-dom';
import {
  LayoutGrid,
  Building2,
  Cpu,
  Zap,
  Snowflake,
  Leaf,
  Layers,
  Landmark,
  MapPin,
  Network,
  Gauge,
  Bot,
  Shield,
  Scale,
  Lightbulb,
  ChevronRight,
} from 'lucide-react';
const topicIcons = {
  infrastructure: Building2,
  'ai-compute-gpus': Cpu,
  'power-energy': Zap,
  cooling: Snowflake,
  sustainability: Leaf,
  'hyperscaler-investments': Layers,
  economics: Landmark,
  'site-selection': MapPin,
  networking: Network,
  optimization: Gauge,
  'ai-agentic-ai': Bot,
  security: Shield,
  regulation: Scale,
  'emerging-technologies': Lightbulb,
};
import { useResource } from '../hooks/useResource.js';
import ResourceState from '../components/common/ResourceState.jsx';
export default function Topics() {
  const resource = useResource('/topics');
  return (
    <>
      <h1>Topics</h1>
      <p className="description">Explore data center themes. Counts reflect indexed metadata.</p>
      <ResourceState {...resource} />
      <div className="topic-grid">
        {resource.data?.data.map((t) => {
          const Icon = topicIcons[t.slug] || LayoutGrid;
          return (
            <Link className="topic-card" key={t.slug} to={`/?topic=${encodeURIComponent(t.slug)}`}>
              <Icon size={26} />
              <div>
                <h2>{t.name}</h2>
                <span>{t.count} items</span>
              </div>
              <ChevronRight className="topic-chevron" size={18} />
            </Link>
          );
        })}
      </div>
    </>
  );
}
