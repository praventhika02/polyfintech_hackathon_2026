import { AppHeader } from "@/components/layout/AppHeader";
import { WatchlistClient } from "@/components/watchlist/WatchlistClient";

export default function WatchlistPage() {
  return (
    <>
      <AppHeader />
      <main className="page">
        <div className="page-header">
          <div>
            <span className="eyebrow">Watchlist</span>
            <h1>Saved companies and verdicts.</h1>
            <p>Watchlist entries are stored locally in your browser under <code>esg_pulse_watchlist</code>.</p>
          </div>
        </div>
        <WatchlistClient />
      </main>
    </>
  );
}
