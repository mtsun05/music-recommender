import { SignInButton, SignUpButton } from "@clerk/clerk-react";

export function LandingPage() {
  return (
    <main className="min-h-screen p-5">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <div>
          <span className="mr-2.5 inline-grid h-8 w-8 place-items-center rounded-lg bg-[#2ee982] font-black text-[#051008]">
            MR
          </span>
          <span className="font-extrabold">Music Recommender</span>
        </div>
      </nav>
      <section className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center">
        <div className="max-w-[740px]">
          <p className="mb-2.5 text-xs font-extrabold uppercase text-[#78d99e]">Stage 1 scaffold</p>
          <h1 className="mb-4 text-5xl font-extrabold leading-[0.94] text-[#e5efe9] sm:text-7xl lg:text-[5.5rem]">
            Music Recommender
          </h1>
          <p className="max-w-[620px] text-[1.08rem] text-[#aec7b8]">
            A cleaner foundation for music discovery: start with a URL or query, queue the request,
            and let the recommendation pipeline grow from real catalog data later.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <SignInButton mode="modal">
              <button
                type="button"
                className="cursor-pointer rounded-lg bg-[#2ee982] px-4 py-3 font-bold text-[#031006] disabled:cursor-wait disabled:opacity-70"
              >
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                type="button"
                className="cursor-pointer rounded-lg border border-[#244b32] bg-[#122017] px-4 py-3 font-bold text-[#d9fbe7] disabled:cursor-wait disabled:opacity-70"
              >
                Sign up
              </button>
            </SignUpButton>
          </div>
        </div>
      </section>
    </main>
  );
}
