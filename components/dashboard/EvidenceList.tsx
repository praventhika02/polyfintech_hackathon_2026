import type { ESGAnalysis } from "@/lib/esg/types";

export function EvidenceList({ analysis }: { analysis: ESGAnalysis }) {
  return (
    <div className="evidence-list">
      {analysis.news.length ? (
        analysis.news.slice(0, 6).map((article) => (
          <a className="evidence-row" href={article.url} key={`${article.title}-${article.url}`} target="_blank" rel="noreferrer">
            <span className={`category-badge ${article.category}`}>{article.category}</span>
            <span>
              <strong>{article.title}</strong>
              <small>
                {article.source} · {article.sentiment}
              </small>
            </span>
          </a>
        ))
      ) : (
        <div className="empty-state">
          <strong>No live ESG news detected</strong>
          <p>Try a larger listed company or add more data connectors. The model lowers confidence when evidence is sparse.</p>
        </div>
      )}
    </div>
  );
}
