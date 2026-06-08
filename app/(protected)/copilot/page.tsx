import { CopilotClient } from "@/components/copilot/CopilotClient";

export default function CopilotPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>AI Copilot</h1>
          <p>Ask ESG Alpha questions grounded in saved analysis data and alert evidence.</p>
        </div>
      </div>
      <CopilotClient />
    </main>
  );
}
