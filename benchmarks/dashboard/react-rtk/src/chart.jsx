import { useMemo } from "react"
import { useSelector } from "react-redux"

import { makeSelectChartData } from "./store/selectors"

const VALUE_TO_PX = 100
const VALUE_TO_HSL = 120

export const Chart = ({ chartId }) => {
  const selectChartData = useMemo(makeSelectChartData, [])
  const { title, values, max, avg } = useSelector((state) =>
    selectChartData(state, chartId),
  )

  return (
    <div className="chart">
      <h3>{title}</h3>
      <div className="chart-bars">
        {values.map((value, i) => (
          <div
            key={i}
            className="bar"
            style={{
              height: `${(value / max) * VALUE_TO_PX}px`,
              backgroundColor: `hsl(${(value / max) * VALUE_TO_HSL}, 70%, 50%)`,
            }}
          />
        ))}
      </div>
      <div className="chart-info">Avg: {avg}</div>
    </div>
  )
}
