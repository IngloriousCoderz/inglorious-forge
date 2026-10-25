# web-nextgen-pos

Craig Larman's **NextGen POS**, the running case study of _Applying UML and Patterns_, rebuilt with `@inglorious/store`, `@inglorious/web` and `@inglorious/ui`.

The book uses the POS to teach GRASP and the GoF patterns. This demo reuses it to make one point: **once your building blocks are plain data and plain functions, most of those patterns stop being structures you build and become idioms you use.** That isn't a new claim. Peter Norvig made it in 1996, when he showed that 16 of the 23 GoF patterns are "invisible or simpler" in a language with first-class functions. This is the same argument, made with a concrete app instead of slides.

GRASP is a different story. Information Expert, Creator and Low Coupling are about deciding _where_ each responsibility goes, and that decision doesn't go away. The demo shows these principles still at work, and often easier to see.

If GRASP is new to you, the [SOLID principles](#and-solid) cover much of the same ground, and there is a section mapping the demo onto them too.

## What it does

The scope is the **Process Sale** use case from Larman's iterations 1–3:

- Scan items, end the sale, get a tax quote from an external calculator, take payment, and give change.
- Switch the **pricing policy** at any time, including mid-sale: regular price, 10% off, $5 off over $50, or a composite that picks the best deal for the customer or for the store.
- Switch the **tax calculator** between two third-party vendors with incompatible APIs.
- Take the **accounting system offline**. Completed sales are stored locally and forwarded automatically when the system comes back.

Each panel's footer names the patterns it is built from.

## The pattern map

| Pattern                                                     | Larman's design                                                | Here                                                                                                                                                                                                                         | Where                                                          |
| ----------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Controller**                                              | `Register` as a facade controller for system operations        | `api.notify("#sale1:itemEnter", id)`. The event map _is_ the controller: it routes system operations to whoever handles them.                                                                                                | [sale/index.js](src/sale/index.js)                             |
| **Model-View Separation**                                   | Views observe the domain; the domain never calls the UI        | Templates take props and return markup; store wiring happens in the type's `render`.                                                                                                                                         | [sale/template.js](src/sale/template.js)                       |
| **Creator**                                                 | `Register` creates `Sale`                                      | `Register.saleStart` announces `add`, and the store runs the new sale's `create`.                                                                                                                                            | [register/index.js](src/register/index.js)                     |
| **Information Expert**                                      | `Sale.getTotal()` asks each `SalesLineItem`                    | Pure functions over the data that holds the information: lines, catalog, policy. Totals are derived, never stored.                                                                                                           | [domain/sale.js](src/domain/sale.js)                           |
| **State**                                                   | The sale lifecycle                                             | `fsm({ open, totaling, paying, complete })`. An event the current state doesn't name is one nobody listens to, so entering items into a sale being paid for needs no guard. A late tax reply is ignored for the same reason. | [sale/handlers.js](src/sale/handlers.js)                       |
| **Decorator**                                               | Wrapping an object to add behaviour                            | A type is a list of behaviours composed left to right. `fsm(states)` is a function that takes the type built so far and wraps its handlers.                                                                                  | [sale/index.js](src/sale/index.js)                             |
| **Strategy**, **Polymorphism**                              | `ISalePricingStrategy` with one class per policy               | A policy is data (`{ kind: "percent", percentage: 10 }`); its behaviour is a function looked up by `kind`.                                                                                                                   | [domain/pricing.js](src/domain/pricing.js)                     |
| **Composite**                                               | `CompositeBestForCustomerPricingStrategy`                      | A function with the same signature as a leaf that folds over its children. Composites nest for free.                                                                                                                         | [domain/pricing.js](src/domain/pricing.js)                     |
| **Adapter**                                                 | `ITaxCalculatorAdapter` with one class per vendor              | One function per vendor: line items in, cents out.                                                                                                                                                                           | [services/tax-calculators.js](src/services/tax-calculators.js) |
| **Factory**, **Singleton**                                  | `ServicesFactory.getInstance().getTaxCalculatorAdapter()`      | `taxCalculators[services.taxCalculator]`. The property is in the store, and the module system already provides the single instance.                                                                                          | [services/tax-calculators.js](src/services/tax-calculators.js) |
| **Observer**                                                | `PropertyListener` to refresh the total on screen              | The view re-renders whenever the state changes, so there is nothing to wire. Domain listeners hear broadcast events (`saleComplete`, `networkChange`) without the sender knowing they exist.                                 | [accounting/index.js](src/accounting/index.js)                 |
| **Proxy** (redirection)                                     | `AccountingRedirectionProxy` with local failover               | `handleAsync("post")` tries the remote system and falls back to a local queue, which is flushed on `networkChange`.                                                                                                          | [accounting/index.js](src/accounting/index.js)                 |
| **Command**                                                 | Store-and-forward of postings                                  | Every event is a serializable `{ type, payload }`, and so is every queued receipt. Redux DevTools can log, replay and time-travel a whole shift.                                                                             | [store/middlewares.js](src/store/middlewares.js)               |
| **Template Method**                                         | A superclass algorithm with overridable steps                  | `{ ...Table, renderCell() {} }`: override one step of a UI component with an object spread.                                                                                                                                  | [receipt-table/index.js](src/receipt-table/index.js)           |
| **Pure Fabrication**                                        | Classes that aren't in the domain, such as `PersistentStorage` | `Accounting` is a type with no domain counterpart. It exists to keep the books.                                                                                                                                              | [accounting/index.js](src/accounting/index.js)                 |
| **Indirection**, **Protected Variations**, **Low Coupling** | Interfaces between stable and varying parts                    | Event names. `Sale` announces `saleComplete` without importing accounting, and adding a listener never means editing the sale.                                                                                               | [sale/handlers.js](src/sale/handlers.js)                       |

## And SOLID

SOLID was written with classes in mind, but each principle is about a property of the code, not about classes. Here is how each one shows up when the units are data, functions and events. GRASP's Low Coupling and Protected Variations are mostly Open/Closed and Dependency Inversion under other names.

| Principle                 | What it asks                                   | Here                                                                                                                                                                                                                                                                                                               | Where                                                                                      |
| ------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| **Single Responsibility** | One reason to change per unit                  | Each type owns one concern: `Sale` the lifecycle, `Accounting` the books, `Pricing` the policy. Within a component, the template only draws and the type only wires it to the store. Rendering, behaviour and domain rules never share a function.                                                                 | [sale/](src/sale/), [domain/](src/domain/)                                                 |
| **Open/Closed**           | Extend without editing what works              | A new pricing policy is a new `kind` and some data; nothing that computes totals changes. A new reaction to a sale is a new type listening to `saleComplete`; `Sale` is never touched. `fsm(states)` adds a state machine to a type without editing the type.                                                      | [domain/pricing.js](src/domain/pricing.js), [accounting/index.js](src/accounting/index.js) |
| **Liskov Substitution**   | Anything that claims a contract must honour it | Without inheritance, substitution means "same signature, same contract". Every tax adapter takes line items and returns cents, and [one test](src/services/tax-calculators.test.js) runs the same assertion over all of them. A composite policy can stand in for a leaf; `ReceiptTable` can stand in for `Table`. | [services/tax-calculators.js](src/services/tax-calculators.js)                             |
| **Interface Segregation** | Depend only on what you use                    | A type implements only the events it cares about; there is no interface to implement in full. A state names only the events it answers. A template gets the props it draws, never the store.                                                                                                                       | [sale/handlers.js](src/sale/handlers.js), [sale/template.js](src/sale/template.js)         |
| **Dependency Inversion**  | Depend on abstractions, not concretions        | `Sale` depends on an event name, `saleComplete`, not on `Accounting`. It reaches the tax adapter through the configured key, not a vendor import. Views depend on callbacks, not the store. Each dependency is a name or a function signature, which is as abstract as an abstraction gets.                        | [sale/handlers.js](src/sale/handlers.js)                                                   |

## Things to try

1. Put items in a sale, end it, then switch the pricing policy while it waits for payment. The total updates, but a completed sale's receipt doesn't.
2. Switch the tax calculator. Both vendors produce the same tax through very different APIs.
3. Take the accounting system offline, ring up a couple of sales, then bring it back and watch them post.
4. Open Redux DevTools and replay the shift.

## Quick start

```bash
# from repository root
cd examples/apps/web-nextgen-pos
pnpm install
pnpm dev
```

Run the tests with `pnpm test`. They cover the pricing strategies, both tax adapters, the sale lifecycle and the accounting failover.
