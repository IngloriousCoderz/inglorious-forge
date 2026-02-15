import { useSelector } from "react-redux"

import { selectMetrics } from "./store/selectors"

const ERROR_FPS = 30
const WARN_FPS = 50

export const MetricsDisplay = () => {
  const metrics = useSelector(selectMetrics)

  return (
    <div className="metrics">
      <div
        className={`metric ${metrics.fps < ERROR_FPS ? "error" : metrics.fps < WARN_FPS ? "warning" : ""}`}
      >
        FPS: {metrics.fps}
      </div>
      <div className="metric">Update Time: {metrics.renderTime}ms</div>
      <div className="metric">Updates: {metrics.updateCount}</div>
    </div>
  )
}

MetricsDisplay.displayName = "MetricsDisplay"
