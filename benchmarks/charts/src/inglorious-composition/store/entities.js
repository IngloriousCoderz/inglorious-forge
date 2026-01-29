import { areaChart, barChart, lineChart, pieChart } from "@inglorious/charts"
import { generateChartData } from "../../utils.js"

// Create entities and initialize them
const lineEntity = {
  id: "lineChart1",
  type: "line",
  data: generateChartData(),
}
lineChart.create(lineEntity)

const areaEntity = {
  id: "areaChart1",
  type: "area",
  data: generateChartData(),
}
areaChart.create(areaEntity)

const barEntity = {
  id: "barChart1",
  type: "bar",
  data: generateChartData(),
}
barChart.create(barEntity)

const pieEntity = {
  id: "pieChart1",
  type: "pie",
  data: generateChartData(10).map((d) => ({
    label: d.name,
    value: d.value,
  })),
}
pieChart.create(pieEntity)

export const entities = {
  lineChart1: lineEntity,
  areaChart1: areaEntity,
  barChart1: barEntity,
  pieChart1: pieEntity,
}
