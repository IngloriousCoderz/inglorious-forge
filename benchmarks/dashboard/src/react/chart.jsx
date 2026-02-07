const VALUE_TO_PX = 100
const VALUE_TO_HSL = 120
const DEFAULT_AVG = 0

export const Chart = ({ data, title }) => {
  const values = data.map((r) => r.value)
  const max = Math.max(...values)
  const avg = values.length
    ? Math.floor(values.reduce((a, b) => a + b) / values.length)
    : DEFAULT_AVG

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
