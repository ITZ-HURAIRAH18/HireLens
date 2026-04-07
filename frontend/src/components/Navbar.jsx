import "./Navbar.css";

export default function Navbar({ onGetStarted }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="navbar-logo-hire">Hire</span>
        <span className="navbar-logo-lens">Lens</span>
      </div>

      <div className="navbar-right">
        <a href="#how-it-works" className="navbar-link">How it works</a>
        <a href="#examples" className="navbar-link">Examples</a>
        <button className="navbar-cta" onClick={onGetStarted}>
          Get started
        </button>
      </div>
    </nav>
  );
}
