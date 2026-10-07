export default function Background() {
  return (
    <div className="backdrop" aria-hidden="true">
      <span className="fog fog--a" />
      <span className="fog fog--b" />
      <span className="fog fog--c" />
      <span className="backdrop__grain" />
      <span className="backdrop__vignette" />
    </div>
  )
}
