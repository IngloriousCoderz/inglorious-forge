import ccAmex from "@iconify-icons/fa7-brands/cc-amex"
import ccApplePay from "@iconify-icons/fa7-brands/cc-apple-pay"
import ccMastercard from "@iconify-icons/fa7-brands/cc-mastercard"
import ccPaypal from "@iconify-icons/fa7-brands/cc-paypal"
import ccStripe from "@iconify-icons/fa7-brands/cc-stripe"
import ccVisa from "@iconify-icons/fa7-brands/cc-visa"
import alternateEmailOutline from "@iconify-icons/material-symbols/alternate-email-outline"
import businessCenterOutline from "@iconify-icons/material-symbols/business-center-outline"
import northOutline from "@iconify-icons/material-symbols/north-outline"
import person2Outline from "@iconify-icons/material-symbols/person-2-outline"
import personOutline from "@iconify-icons/material-symbols/person-outline"
import publicOutline from "@iconify-icons/material-symbols/public-outline"
import southOutline from "@iconify-icons/material-symbols/south-outline"
import tagOutline from "@iconify-icons/material-symbols/tag-outline"
import thumbUpOutline from "@iconify-icons/material-symbols/thumb-up-outline"
import travelExploreOutline from "@iconify-icons/material-symbols/travel-explore-outline"
import workOutline from "@iconify-icons/material-symbols/work-outline"
export const statCards = [
  {
    id: "users",
    label: "Users",
    value: "26K",
    change: "-12.4%",
    trendIcon: southOutline,
    className: "iw-dashboard-stat-primary",
    chartType: "line",
    data: [65, 59, 84, 84, 51, 55, 40],
  },
  {
    id: "income",
    label: "Income",
    value: "$6.2K",
    change: "40.9%",
    trendIcon: northOutline,
    className: "iw-dashboard-stat-info",
    chartType: "line",
    hasDots: true,
    data: [1, 18, 9, 17, 34, 22, 11],
  },
  {
    id: "conversionRate",
    label: "Conversion Rate",
    value: "2.49%",
    change: "84.7%",
    trendIcon: northOutline,
    className: "iw-dashboard-stat-warning",
    chartType: "area",
    data: [78, 81, 80, 45, 34, 12, 40],
  },
  {
    id: "sessions",
    label: "Sessions",
    value: "44K",
    change: "-23.6%",
    trendIcon: southOutline,
    className: "iw-dashboard-stat-danger",
    chartType: "bar",
    data: [78, 81, 80, 45, 34, 12, 40, 85, 65, 23, 12, 98, 34, 84, 67, 82],
  },
]

export const trafficSeries = [
  { month: "Jan", visits: 132, unique: 62 },
  { month: "Feb", visits: 96, unique: 101 },
  { month: "Mar", visits: 147, unique: 110 },
  { month: "Apr", visits: 131, unique: 112 },
  { month: "May", visits: 170, unique: 133 },
  { month: "Jun", visits: 51, unique: 88 },
  { month: "Jul", visits: 142, unique: 145 },
]

export const trafficSummary = [
  {
    label: "Visits",
    value: "29.703 Users (40%)",
    progress: 40,
    color: "success",
  },
  {
    label: "Unique",
    value: "24.093 Users (20%)",
    progress: 20,
    color: "info",
  },
  {
    label: "Pageviews",
    value: "78.706 Views (60%)",
    progress: 60,
    color: "warning",
  },
  {
    label: "New Users",
    value: "22.123 Users (80%)",
    progress: 80,
    color: "error",
  },
  // { label: "Bounce Rate", value: "40.15%", progress: 40, color: "primary" },
]

export const socialCards = [
  {
    icon: thumbUpOutline,
    capClass: "iw-dashboard-social-cap-facebook",
    top: "89k",
    bottom: "459",
    topLabel: "friends",
    bottomLabel: "feeds",
    data: [24, 28, 20, 30, 26, 34, 29],
  },
  {
    icon: alternateEmailOutline,
    capClass: "iw-dashboard-social-cap-twitter",
    top: "973k",
    bottom: "1.792",
    topLabel: "followers",
    bottomLabel: "tweets",
    data: [12, 19, 16, 22, 24, 28, 32],
  },
  {
    icon: workOutline,
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
  ["Male", 43, personOutline, "warning", "", ""],
  ["Female", 37, person2Outline, "warning", "", ""],
  ["Organic Search", 56, travelExploreOutline, "success", "191.235", "(56%)"],
  ["Facebook", 15, publicOutline, "success", "51.223", "(15%)"],
  ["Twitter", 11, tagOutline, "success", "37.564", "(11%)"],
  ["LinkedIn", 8, businessCenterOutline, "success", "27.319", "(8%)"],
]

export const userRows = [
  {
    id: 1,
    initials: "YA",
    status: "success",
    name: "Yiorgos Avraamu",
    subtitle: "New | Registered: Jan 1, 2023",
    country: "🇺🇸",
    usage: 50,
    range: "Jun 11, 2023 - Jul 10, 2023",
    payment: ccMastercard,
    activity: "10 sec ago",
  },
  {
    id: 2,
    initials: "AT",
    status: "error",
    name: "Avram Tarasios",
    subtitle: "Recurring | Registered: Jan 1, 2023",
    country: "🇧🇷",
    usage: 10,
    range: "Jun 11, 2023 - Jul 10, 2023",
    payment: ccVisa,
    activity: "5 minutes ago",
  },
  {
    id: 3,
    initials: "QE",
    status: "warning",
    name: "Quintin Ed",
    subtitle: "New | Registered: Jan 1, 2023",
    country: "🇮🇳",
    usage: 74,
    range: "Jun 11, 2023 - Jul 10, 2023",
    payment: ccStripe,
    activity: "1 hour ago",
  },
  {
    id: 4,
    initials: "EK",
    status: "secondary",
    name: "Eneas Kwadwo",
    subtitle: "New | Registered: Jan 1, 2023",
    country: "🇫🇷",
    usage: 98,
    range: "Jun 11, 2023 - Jul 10, 2023",
    payment: ccPaypal,
    activity: "Last month",
  },
  {
    id: 5,
    initials: "AT",
    status: "success",
    name: "Agapetus Tadeáš",
    subtitle: "New | Registered: Jan 1, 2023",
    country: "🇪🇸",
    usage: 22,
    range: "Jun 11, 2023 - Jul 10, 2023",
    payment: ccApplePay,
    activity: "Last week",
  },
  {
    id: 6,
    initials: "FD",
    status: "error",
    name: "Friderik Dávid",
    subtitle: "New | Registered: Jan 1, 2023",
    country: "🇵🇱",
    usage: 43,
    range: "Jun 11, 2023 - Jul 10, 2023",
    payment: ccAmex,
    activity: "Yesterday",
  },
]
