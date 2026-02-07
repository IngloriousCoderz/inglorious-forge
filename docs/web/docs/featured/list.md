---
title: Virtual List Component
description: High-performance virtual scrolling for large datasets
---

# Virtual List

Efficient rendering of large lists by only rendering visible items.

## Basic Setup

```javascript
import { list } from "@inglorious/web/list"

const productList = {
  ...list,

  renderItem(item, index) {
    return html`
      <div class="product">
        ${index}: <strong>${item.name}</strong> — $${item.price}
      </div>
    `
  },
}

const types = {
  productList,
}

const entities = {
  products: {
    type: "productList",
    items: Array.from({ length: 10000 }, (_, i) => ({
      name: `Product ${i}`,
      price: Math.random() * 100,
    })),
    viewportHeight: 400,
    estimatedHeight: 40,
    bufferSize: 5,
  },
}
```

## Configuration

```javascript
{
  type: 'list',
  items: [], // Data to render
  viewportHeight: 400, // Height of scrolling container
  itemHeight: null, // Fixed height (auto-measure if null)
  estimatedHeight: 40, // Fallback estimate
  bufferSize: 5, // Extra items to render before/after visible
  visibleRange: { start: 0, end: 10 }, // Current visible range
}
```

## Events

```javascript
// On scroll
api.notify("#list:scroll", scrollContainerElement)

// Measure item height
api.notify("#list:measureHeight", containerElement)
```

## Item Rendering

```javascript
const customList = {
  ...list,

  renderItem(item, index) {
    return html`
      <div class="item" @click=${() => console.log(item)}>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
      </div>
    `
  },
}
```

## Performance Tips

- Use `renderItem` for consistent item height
- Set `itemHeight` explicitly if possible
- Increase `bufferSize` if scrolling feels jittery
- Use repeat() directive if items can reorder

**[Full Virtual List Documentation](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/packages/web#virtualized-lists)**
