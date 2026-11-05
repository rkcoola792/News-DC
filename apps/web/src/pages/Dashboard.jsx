import { Layers, FileText, Play, FlaskConical, MessagesSquare } from 'lucide-react';
import { useNews } from '../context/NewsContext.jsx';

export default function Dashboard() {
  const { history } = useNews();
  return (
    <>
      <h1>Dashboard</h1>
      <p className="description">Platform health, ingestion status and content overview.</p>
      <div className="metrics">
        {[
          ['Total content', Layers],
          ['Articles', FileText],
          ['Videos', Play],
          ['Research', FlaskConical],
          ['Discussions', MessagesSquare],
        ].map(([label, Icon]) => (
          <div className="metric" key={label}>
            <Icon size={21} />
            <span>{label}</span>
            <strong>—</strong>
          </div>
        ))}
      </div>
      <div className="dashboard-panels">
        <section>
          <h2>Content ingestion</h2>
          <div className="chart-empty">Ingestion history will appear after your first sync.</div>
        </section>
        <section>
          <h2>Ingestion status</h2>
          <p>
            RSS feeds <span>Not connected</span>
          </p>
          <p>
            Public APIs <span>Not connected</span>
          </p>
          <p>
            Last sync <span>Not available</span>
          </p>
        </section>
      </div>
    </>
  );
}
