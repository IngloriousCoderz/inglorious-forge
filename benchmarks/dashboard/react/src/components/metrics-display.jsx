const ERROR_FPS = 30
const WARN_FPS = 50

export const MetricsDisplay = ({ metrics }) => {
  const fpsClass =
    metrics.fps < ERROR_FPS ? "error" : metrics.fps < WARN_FPS ? "warning" : ""

  return (
    <div className="metrics">
      <div className={`metric ${fpsClass}`}>FPS(avg10): {metrics.fps}</div>
      <div className="metric">FPS(now): {metrics.fpsNow}</div>
      <div className="metric">
        30s:{" "}
        {metrics.benchmark.done
          ? "DONE"
          : `${metrics.benchmark.remaining}s left`}
      </div>
      <div className="metric">
        Mean/Min/Max: {metrics.benchmark.mean}/{metrics.benchmark.min}/
        {metrics.benchmark.max}
      </div>
      <div className="metric">Update Time: {metrics.renderTime}ms</div>
      <div className="metric">Updates: {metrics.updateCount}</div>
    </div>
  )
}
