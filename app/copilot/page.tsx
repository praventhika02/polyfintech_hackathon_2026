import { CopilotClient } from "@/components/copilot/CopilotClient";
import { AppHeader } from "@/components/layout/AppHeader";

export default function CopilotPage() {
  return (
    <>
      <AppHeader />
      <main className="page">
        <div className="page-header">
          <div>
            <span className="eyebrow">AI Investment Copilot</span>
            <h1>Ask questions grounded in ESG analysis data.</h1>
            <p>The copilot retrieves live-scored company twins and summarizes only the evidence available to the app.</p>
          </div>
        </div>
        <CopilotClient />
      </main>
    </>
  );
}
