class MyCellComponent {
  eGui
  eButton
  eventListener

  init(params) {
    this.eGui = document.createElement("div")
    this.eGui.innerHTML =
      `
      <button>+</button>
    ` + params.value
    this.eButton = this.eGui.querySelector("button")
    this.eventListener = () => alert(`Value: ${params.value}`)
    this.eButton.addEventListener("click", this.eventListener)
  }

  getGui() {
    return this.eGui
  }

  refresh(params) {
    return true
  }

  destroy() {
    this.eButton.removeEventListener("click", this.eventListener)
  }
}

export const entities = {
  agGrid: {
    type: "grid",
    title: "Sales Data",
    tickCount: 0,
    rowIdField: "id",
    themeClass: "ag-theme-quartz",
    columnDefs: [
      { field: "id", maxWidth: 100 },
      { field: "product", cellRenderer: MyCellComponent },
      { field: "category" },
      { field: "country" },
      {
        field: "revenue",
        valueFormatter: (p) => "€" + p.value.toLocaleString(),
      },
      { field: "price", valueFormatter: (p) => "€" + p.value.toLocaleString() },
      { field: "rating" },
      { field: "growth", valueFormatter: ({ value }) => `${value}%` },
    ],
    rowData: [
      {
        id: 1,
        product: "Forge Cloud",
        category: "Software",
        country: "Italy",
        revenue: 120000,
        price: 120,
        rating: 4.7,
        growth: 8.1,
      },
      {
        id: 2,
        product: "Forge Beam",
        category: "Hardware",
        country: "Brazil",
        revenue: 98000,
        price: 98,
        rating: 4.4,
        growth: 5.4,
      },
      {
        id: 3,
        product: "Forge Shield",
        category: "Software",
        country: "United States",
        revenue: 154000,
        price: 154,
        rating: 4.9,
        growth: 10.2,
      },
      {
        id: 4,
        product: "Forge Arc",
        category: "Hardware",
        country: "Germany",
        revenue: 76000,
        price: 76,
        rating: 4.1,
        growth: 3.6,
      },
      {
        id: 5,
        product: "Forge Loop",
        category: "Software",
        country: "Japan",
        revenue: 143000,
        price: 143,
        rating: 4.8,
        growth: 9.4,
      },
    ],
  },
}
