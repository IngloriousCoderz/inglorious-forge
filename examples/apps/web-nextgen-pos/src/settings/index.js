import { Card } from "@inglorious/ui/card"
import { Select } from "@inglorious/ui/select"
import { Switch } from "@inglorious/ui/switch"
import { html } from "@inglorious/web"

import { renderPatterns } from "../patterns/index.js"

const TAX_CALCULATOR_OPTIONS = [
  { value: "taxMaster", label: "TaxMaster" },
  { value: "goodAsGold", label: "GoodAsGold TaxPro" },
]

// The pricing policy in force. Switching it swaps the Strategy every total is
// worked out with, including the one on screen right now.
export const Pricing = {
  policyChange(entity, policyId) {
    entity.policyId = policyId
  },
}

// Which adapter the tax Factory hands out.
export const Services = {
  taxCalculatorChange(entity, taxCalculator) {
    entity.taxCalculator = taxCalculator
  },
}

// A stand-in for the network cable, so that the accounting failover can be tried out.
export const Network = {
  change(entity, isOnline, api) {
    entity.isOnline = isOnline
    api.notify("networkChange", { isOnline })
  },
}

export const Settings = {
  render(_, api) {
    const pricing = api.getEntity("pricing")
    const services = api.getEntity("services")
    const network = api.getEntity("network")

    return Card.render({
      title: "Store configuration",
      subtitle: "Change any of these mid-sale",
      children: html`<div class="settings">
        ${Select.render({
          label: "Pricing policy",
          value: pricing.policyId,
          isFullWidth: true,
          options: Object.entries(pricing.policies).map(([value, policy]) => ({
            value,
            label: policy.label,
          })),
          onChange: (policyId) =>
            api.notify(`#${pricing.id}:policyChange`, policyId),
        })}
        ${Select.render({
          label: "Tax calculator",
          value: services.taxCalculator,
          isFullWidth: true,
          options: TAX_CALCULATOR_OPTIONS,
          onChange: (taxCalculator) =>
            api.notify(`#${services.id}:taxCalculatorChange`, taxCalculator),
        })}
        ${Switch.render({
          label: network.isOnline
            ? "Accounting system reachable"
            : "Accounting system offline",
          isChecked: network.isOnline,
          color: network.isOnline ? "success" : "error",
          onChange: (isOnline) => api.notify(`#${network.id}:change`, isOnline),
        })}
      </div>`,
      footer: renderPatterns([
        "Strategy",
        "Composite",
        "Adapter",
        "Factory",
        "Singleton",
        "Observer",
      ]),
    })
  },
}
