import { handleAsync } from "@inglorious/store/async"

import { accountingSystem } from "../services/vendors.js"

/**
 * Larman's failover design: a Redirection Proxy that tries the remote accounting
 * system and, when that fails, stores the receipts locally to be forwarded later.
 *
 * A Pure Fabrication: there is no accountant in the domain model, only the need to
 * keep the books. It hears about sales by Observer (`saleComplete`) and about the
 * network by Observer (`networkChange`), and neither the sale nor the network knows
 * it exists. The queued receipts are Commands: plain data, waiting to be replayed.
 */
export const Accounting = {
  saleComplete(entity, receipt, api) {
    const { isOnline } = api.getEntity("network")

    api.notify(`#${entity.id}:post`, { receipts: [receipt], isOnline })
  },

  networkChange(entity, { isOnline }, api) {
    if (!isOnline || !entity.queued.length) return

    const { queued } = api.getEntity(entity.id)

    api.notify(`#${entity.id}:post`, { receipts: queued, isOnline })
    entity.queued = []
  },

  ...handleAsync("post", {
    start(entity, { receipts }) {
      entity.sending.push(...receipts.map(({ saleId }) => saleId))
    },

    async run({ receipts, isOnline }) {
      try {
        await accountingSystem.post(receipts, { isOnline })
        return { target: "remote", receipts }
      } catch {
        return { target: "local", receipts }
      }
    },

    success(entity, { target, receipts }) {
      const saleIds = receipts.map(({ saleId }) => saleId)
      entity.sending = entity.sending.filter((id) => !saleIds.includes(id))

      if (target === "remote") {
        entity.posted.push(...saleIds)
        return
      }

      entity.queued.push(...receipts)
    },
  }),
}
