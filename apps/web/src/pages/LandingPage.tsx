import { SignInButton, SignUpButton } from "@clerk/clerk-react";

export function LandingPage() {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <span className="brand-mark">MR</span>
        <span className="brand-name">Music Recommender</span>
      </nav>
      <section className="landing-content">
        <div>
          <p className="eyebrow">Stage 1 scaffold</p>
          <h1>Music Recommender</h1>
          <p>
            A cleaner foundation for music discovery: start with a URL or query, queue the request,
            and let the recommendation pipeline grow from real catalog data later.
          </p>
          <div className="actions">
            <SignInButton mode="modal">
              <button type="button">Sign in</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button type="button" className="secondary-button">
                Sign up
              </button>
            </SignUpButton>
          </div>
        </div>
      </section>
    </main>
  );
}
