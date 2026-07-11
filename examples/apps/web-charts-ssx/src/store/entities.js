// Deterministic data (no Math.random / function props) so SSR and client match.
export const entities = {
  salesLineChart: {
    type: "Line",
    data: [
      { x: 0, y: 50 },
      { x: 1, y: 150 },
      { x: 2, y: 120 },
      { x: 3, y: 180 },
      { x: 4, y: 25 },
      { x: 5, y: 160 },
      { x: 6, y: 190 },
    ],
    width: 800,
    height: 400,
    hasGrid: true,
    hasTooltip: true,
  },

  salesAreaChart: {
    type: "Area",
    data: [
      { x: 0, y: 50 },
      { x: 1, y: 150 },
      { x: 2, y: 120 },
      { x: 3, y: 180 },
      { x: 4, y: 25 },
      { x: 5, y: 160 },
      { x: 6, y: 190 },
    ],
    width: 800,
    height: 400,
    hasGrid: true,
    hasTooltip: true,
  },

  salesBarChart: {
    type: "Bar",
    data: [
      { label: "Jan", value: 100 },
      { label: "Feb", value: 150 },
      { label: "Mar", value: 120 },
      { label: "Apr", value: 180 },
      { label: "May", value: 200 },
      { label: "Jun", value: 160 },
    ],
    width: 800,
    height: 400,
    hasGrid: true,
    hasTooltip: true,
  },

  categoryPieChart: {
    type: "Pie",
    data: [
      { label: "Category A", value: 20 },
      { label: "Category B", value: 35 },
      { label: "Category C", value: 15 },
      { label: "Category D", value: 10 },
      { label: "Category E", value: 10 },
      { label: "Category F", value: 25 },
    ],
    width: 500,
    height: 400,
    hasTooltip: true,
  },

  categoryDonutChart: {
    type: "Donut",
    data: [
      { label: "Desktop", value: 45 },
      { label: "Mobile", value: 30 },
      { label: "Tablet", value: 15 },
      { label: "Other", value: 10 },
    ],
    width: 500,
    height: 400,
    centerText: "Total",
    innerRadiusRatio: 0.6,
    hasTooltip: true,
  },
}
