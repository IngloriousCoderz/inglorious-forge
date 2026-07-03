import { Index } from "solid-js"

export const Chart = (props) => {
  return (
    <div class="chart">
      <h3>{props.chartData.title}</h3>
      <div class="chart-bars">
        <Index each={props.chartData.values}>
          {(value) => (
            <div
              class="bar"
              style={{
                height: `${(value() / props.chartData.max) * 100}px`,
                "background-color": `hsl(${(value() / props.chartData.max) * 120}, 70%, 50%)`,
              }}
            />
          )}
        </Index>
      </div>
      <div class="chart-info">Avg: {props.chartData.avg}</div>
    </div>
  )
}
