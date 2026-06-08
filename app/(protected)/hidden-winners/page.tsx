export default function HiddenWinnersPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Hidden Winners</h1>
          <p>Low to medium current ESG signal with strong positive forward momentum.</p>
        </div>
      </div>
      <section className="profile-panel">
        <div className="list">
          {["DBS", "OCBC", "Tesla"].map((name, index) => (
            <div className="list-row" key={name}>
              <div><strong>{index + 1}. {name}</strong><span style={{ display: "block", color: "var(--muted)" }}>Positive sustainability coverage and improving confidence.</span></div>
              <strong>+{22 - index * 3}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
