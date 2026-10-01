// GradientBackground — "Floral Veil", made with the 21st.dev Gradient
// Builder and exported as live CSS (the builder's own Copy-CSS background,
// plus its soften-blur and grain passes). Zero dependencies: one <div> that
// fills its parent. Drop it behind your content:
// <div className="relative h-96"><GradientBackground className="absolute inset-0" /></div>
// Remix the source recipe (colors, mode, finish) in the editor:
// https://21st.dev/community/gradients/editor?from=8a192437-b877-4628-ae72-239e207f964f
export function GradientBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        containerType: "size",
      }}
    >
      <div
        style={{
          position: "absolute",
        inset: "-0.8cqmin",
        filter: "blur(0.4cqmin)",
        backgroundColor: "#F4B3C2",
        backgroundImage:
          "radial-gradient(circle at 65.29% 44.34%, rgba(234, 244, 252, 1) 0%, rgba(234, 244, 252, 0) 36.9%), radial-gradient(circle at 28.01% 74.76%, rgba(178, 143, 206, 1) 0%, rgba(178, 143, 206, 0) 48.45%), radial-gradient(circle at 52.38% 20.27%, rgba(168, 197, 230, 1) 0%, rgba(168, 197, 230, 0) 60.35%), radial-gradient(circle at 80.52% 84.48%, rgba(244, 179, 194, 1) 0%, rgba(244, 179, 194, 0) 71.9%)",
        }}
      />
    </div>
  )
}
