const ERROR_FPS = 30
const WARN_FPS = 50

export const Metrics = (props) => {
  const fpsClass = () =>
    props.metrics.fps < ERROR_FPS
      ? "error"
      : props.metrics.fps < WARN_FPS
        ? "warning"
        : ""

  return (
    <div class="metrics">
      <div class={`metric ${fpsClass()}`}>FPS(avg10): {props.metrics.fps}</div>
      <div class="metric">FPS(now): {props.metrics.fpsNow}</div>
      <div class="metric">
        30s:{" "}
        {props.metrics.benchmark.done
          ? "DONE"
          : `${props.metrics.benchmark.remaining}s left`}
      </div>
      <div class="metric">
        Mean/Min/Max: {props.metrics.benchmark.mean}/
        {props.metrics.benchmark.min}/{props.metrics.benchmark.max}
      </div>
      <div class="metric">Commit(avg10): {props.metrics.commitAvg10}ms</div>
      <div class="metric">Commit(now): {props.metrics.commitNow}ms</div>
      <div class="metric">Updates: {props.metrics.updateCount}</div>
      <div class="metric">Nodes: {props.nodes}</div>
      <div class="metric">Leaves: {props.leaves}</div>
    </div>
  )
}
