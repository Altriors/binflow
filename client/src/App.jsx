import { Routes, Route, Link } from "react-router-dom";

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1>BinFlow</h1>
      <p>Waste collection complaint platform — client scaffold.</p>
      <nav style={{ display: "flex", gap: "1rem" }}>
        <Link to="/">Home</Link>
      </nav>
      <Routes>
        <Route path="/" element={<p>Add pages under `client/src/pages/`.</p>} />
      </Routes>
    </div>
  );
}
