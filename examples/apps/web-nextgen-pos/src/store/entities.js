const tenPercentOff = {
  label: "10% off",
  kind: "percent",
  percentage: 10,
}

const fiveOffOverFifty = {
  label: "$5 off over $50",
  kind: "absoluteOverThreshold",
  threshold: 5000,
  discount: 500,
}

export const entities = {
  register: {
    type: "Register",
    saleId: null,
    saleCount: 0,
  },

  // ProductCatalog: Information Expert on descriptions, prices and tax categories.
  catalog: {
    type: "Catalog",
    products: {
      100: {
        id: "100",
        description: "Espresso beans",
        price: 1490,
        taxCategory: "food",
      },
      101: {
        id: "101",
        description: "Oat milk",
        price: 299,
        taxCategory: "food",
      },
      102: {
        id: "102",
        description: "Dark chocolate",
        price: 349,
        taxCategory: "food",
      },
      200: {
        id: "200",
        description: "Moka pot",
        price: 3900,
        taxCategory: "general",
      },
      201: {
        id: "201",
        description: "Ceramic mug",
        price: 1250,
        taxCategory: "general",
      },
      202: {
        id: "202",
        description: "Hand grinder",
        price: 5490,
        taxCategory: "general",
      },
    },
  },

  // Pricing policies are data. The functions that read them are in `domain/pricing.js`.
  pricing: {
    type: "Pricing",
    policyId: "bestForCustomer",
    policies: {
      regular: { label: "Regular price", kind: "none" },
      tenPercentOff,
      fiveOffOverFifty,
      bestForCustomer: {
        label: "Best for customer",
        kind: "bestForCustomer",
        policies: [tenPercentOff, fiveOffOverFifty],
      },
      bestForStore: {
        label: "Best for store",
        kind: "bestForStore",
        policies: [tenPercentOff, fiveOffOverFifty],
      },
    },
  },

  services: {
    type: "Services",
    taxCalculator: "taxMaster",
  },

  network: {
    type: "Network",
    isOnline: true,
  },

  accounting: {
    type: "Accounting",
    posted: [],
    queued: [],
    sending: [],
  },

  settings: {
    type: "Settings",
  },

  history: {
    type: "History",
  },
}
