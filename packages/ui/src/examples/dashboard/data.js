export const statCards = [
  {
    label: "Users",
    value: "26K",
    change: "-12.4%",
    direction: "arrow_downward",
    className: "iw-dashboard-stat-primary",
    chartType: "line",
    data: [42, 38, 44, 39, 36, 34, 31],
  },
  {
    label: "Income",
    value: "$6.2K",
    change: "40.9%",
    direction: "arrow_upward",
    className: "iw-dashboard-stat-info",
    chartType: "line",
    hasDots: true,
    data: [18, 24, 19, 30, 32, 37, 41],
  },
  {
    label: "Conversion Rate",
    value: "2.49%",
    change: "84.7%",
    direction: "arrow_upward",
    className: "iw-dashboard-stat-warning",
    chartType: "area",
    data: [8, 11, 12, 16, 17, 15, 19],
  },
  {
    label: "Sessions",
    value: "44K",
    change: "-23.6%",
    direction: "arrow_downward",
    className: "iw-dashboard-stat-danger",
    chartType: "bar",
    data: [60, 58, 54, 51, 46, 42, 39],
  },
]

export const trafficSeries = [
  { name: "Jan", visits: 120, unique: 80, pageviews: 110 },
  { name: "Feb", visits: 138, unique: 94, pageviews: 135 },
  { name: "Mar", visits: 156, unique: 112, pageviews: 148 },
  { name: "Apr", visits: 144, unique: 101, pageviews: 139 },
  { name: "May", visits: 190, unique: 131, pageviews: 182 },
  { name: "Jun", visits: 208, unique: 149, pageviews: 203 },
  { name: "Jul", visits: 228, unique: 160, pageviews: 216 },
]

export const trafficSummary = [
  {
    label: "Visits",
    value: "29.703 Users (40%)",
    progress: 40,
    tone: "success",
  },
  { label: "Unique", value: "24.093 Users (20%)", progress: 20, tone: "info" },
  {
    label: "Pageviews",
    value: "78.706 Views (60%)",
    progress: 60,
    tone: "warning",
  },
  {
    label: "New Users",
    value: "22.123 Users (80%)",
    progress: 80,
    tone: "error",
  },
  { label: "Bounce Rate", value: "40.15%", progress: 40, tone: "primary" },
]

export const socialCards = [
  {
    icon: "thumb_up",
    capClass: "iw-dashboard-social-cap-facebook",
    top: "89k",
    bottom: "459",
    topLabel: "friends",
    bottomLabel: "feeds",
    data: [24, 28, 20, 30, 26, 34, 29],
  },
  {
    icon: "alternate_email",
    capClass: "iw-dashboard-social-cap-twitter",
    top: "973k",
    bottom: "1.792",
    topLabel: "followers",
    bottomLabel: "tweets",
    data: [12, 19, 16, 22, 24, 28, 32],
  },
  {
    icon: "work",
    capClass: "iw-dashboard-social-cap-linkedin",
    top: "500+",
    bottom: "292",
    topLabel: "contacts",
    bottomLabel: "feeds",
    data: [9, 12, 10, 14, 13, 17, 16],
  },
]

export const clientBars = [
  ["Monday", 34, 78],
  ["Tuesday", 56, 94],
  ["Wednesday", 12, 67],
  ["Thursday", 43, 91],
  ["Friday", 22, 73],
  ["Saturday", 53, 82],
  ["Sunday", 9, 69],
]

export const sourceBars = [
  ["Male", 43, "person", "warning", "", ""],
  ["Female", 37, "person_2", "warning", "", ""],
  ["Organic Search", 56, "travel_explore", "success", "191.235", "(56%)"],
  ["Facebook", 15, "public", "success", "51.223", "(15%)"],
  ["Twitter", 11, "tag", "success", "37.564", "(11%)"],
  ["LinkedIn", 8, "business_center", "success", "27.319", "(8%)"],
]

export const userRows = [
  {
    id: 1,
    name: "Yiorgos Avraamu",
    subtitle: "New | Registered: Jan 1, 2023",
    initials: "YA",
    country: "US",
    usage: 50,
    range: "Jun 11, 2023 - Jul 10, 2023",
    payment: "Mastercard",
    activity: "10 sec ago",
    status: "success",
  },
  {
    id: 2,
    name: "Avram Tarasios",
    subtitle: "Recurring | Registered: Jan 1, 2023",
    initials: "AT",
    country: "BR",
    usage: 10,
    range: "Jun 11, 2023 - Jul 10, 2023",
    payment: "Visa",
    activity: "5 minutes ago",
    status: "error",
  },
  {
    id: 3,
    name: "Quintin Ed",
    subtitle: "New | Registered: Jan 1, 2023",
    initials: "QE",
    country: "IN",
    usage: 74,
    range: "Jun 11, 2023 - Jul 10, 2023",
    payment: "Stripe",
    activity: "1 hour ago",
    status: "warning",
  },
  {
    id: 4,
    name: "Eneas Kwadwo",
    subtitle: "New | Registered: Jan 1, 2023",
    initials: "EK",
    country: "FR",
    usage: 98,
    range: "Jun 11, 2023 - Jul 10, 2023",
    payment: "PayPal",
    activity: "Last month",
    status: "secondary",
  },
]
