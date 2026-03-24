const steps = [
  {
    number: "01",
    title: "Create your profile",
    description: "Three minutes. Zero paperwork. Start with the facts that matter.",
  },
  {
    number: "02",
    title: "Answer a few questions",
    description: "Share your income, goals, investments, and where you want to go.",
  },
  {
    number: "03",
    title: "Get your plan",
    description: "Receive AI-generated guidance that is personalized, actionable, and clear.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24">
      <div className="section-shell space-y-14">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-mutedText">
            How it works
          </p>
          <h2 className="max-w-2xl text-balance text-4xl font-black sm:text-5xl">
            Start from clarity, not complexity.
          </h2>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.number}
              className="relative overflow-hidden rounded-lg border border-line bg-white p-8"
            >
              <span className="pointer-events-none absolute right-4 top-3 font-heading text-7xl font-black text-surface">
                {step.number}
              </span>
              <div className="relative space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                  Step {step.number}
                </p>
                <h3 className="text-2xl font-bold">{step.title}</h3>
                <p className="text-base leading-8 text-bodyText">{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
