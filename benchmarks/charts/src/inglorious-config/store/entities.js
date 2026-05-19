import { Chart } from "@inglorious/charts"
import { generateChartData } from "../../utils.js"

// Create entities and initialize them
const lineEntity = {
  id: "lineChart1",
  type: "line",
  data: generateChartData(),
  width: 400,
  height: 300,
  hasGrid: true,
  hasTooltip: true,
}
Chart.create(lineEntity)

const areaEntity = {
  id: "areaChart1",
  type: "area",
  data: generateChartData(),
  width: 400,
  height: 300,
  hasGrid: true,
  hasTooltip: true,
}
Chart.create(areaEntity)

const barEntity = {
  id: "barChart1",
  type: "bar",
  data: generateChartData(),
  width: 400,
  height: 300,
  hasGrid: true,
  hasTooltip: true,
}
Chart.create(barEntity)

const pieEntity = {
  id: "pieChart1",
  type: "pie",
  data: generateChartData(10).map((d) => ({
    label: d.name,
    value: d.value,
  })),
  width: 400,
  height: 300,
  hasTooltip: true,
}
Chart.create(pieEntity)

export const entities = {
  lineChart1: lineEntity,
  areaChart1: areaEntity,
  barChart1: barEntity,
  pieChart1: pieEntity,
}
