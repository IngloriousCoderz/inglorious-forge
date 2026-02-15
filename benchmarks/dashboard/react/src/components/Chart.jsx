export const Chart = ({ chartData }) => {
  const { title, values, max, avg } = chartData

  return (
    <div className="chart">
      <h3>{title}</h3>
      <div className="chart-bars">
        {values.map((value, i) => (
          <div
            key={i}
            className="bar"
            style={{
              height: `${(value / max) * 100}px`,
              backgroundColor: `hsl(${(value / max) * 120}, 70%, 50%)`,
            }}
          />
        ))}
      </div>
      <div className="chart-info">Avg: {avg}</div>
    </div>
  )
}
