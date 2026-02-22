export const data = [
  {
    id: "2022-07-30_the_journey_begins",
    title: "The Journey Begins",
    date: "2022-07-30",
    body: `At the beginning of summer, I started a new project. The objective was to create a **Redux-based game engine**. I love FP and wanted to experiment with how good it could be for developing video games.

The core idea was simple: model the game loop as a pure function.

\`\`\`javascript
const gameLoop = (state, action) => {
  const nextState = reducer(state, action);
  render(nextState);
  return nextState;
};
\`\`\`

If we model game state as $S_t$ and actions as $A_t$, then: $S_{t+1} = f(S_t, A_t)$ where $f$ is a pure reducer function.

\`\`\`mermaid
graph LR
    A[Current State] --> B[Pure Reducer]
    C[Action/Event] --> B
    B --> D[Next State]
    D --> E[Render]
    E --> F[Next Frame]
\`\`\``,
  },
  {
    id: "2022-08-22_entity_store",
    title: "An Entity-Based Store",
    date: "2022-08-22",
    body: `This was already my second attempt at creating a game engine. On the first attempt, I noticed that Redux was not really a good fit, so this time I **created my own**.

Instead of slices and reducers, I designed an entity-based store where each entity has a type that defines its behavior:

\`\`\`javascript
const types = {
  player: {
    move(entity, direction) {
      entity.position.x += direction.x;
      entity.position.y += direction.y;
    }
  }
};

const entities = {
  player1: { type: 'player', position: { x: 0, y: 0 } }
};
\`\`\`

Each entity $E_i$ belongs to a type $T$ where $T$ defines the set of event handlers $H = \\{h_1, h_2, ..., h_n\\}$.

\`\`\`mermaid
graph TD
    A[Entity Store] --> B[player1: player]
    A --> C[enemy1: enemy]
    B --> D[position]
    B --> E[health]
    C --> F[position]
    C --> G[health]
\`\`\``,
  },
  {
    id: "2023-08-28_game_ai_algorithms",
    title: "Game AI Algorithms",
    date: "2023-08-28",
    body: `The store worked pretty well, but then I lost interest. Then, a year later, I started reading a book on **game AI algorithms**. This reignited my motivation because I wanted to experiment with developing those algorithms using FP instead of OOP.

The entity-based architecture made AI systems elegant:

\`\`\`javascript
const types = {
  enemy: {
    update(entity, deltaTime, api) {
      const player = api.getEntity('player');
      const distance = calculateDistance(entity.pos, player.pos);
      
      if (distance < entity.aggroRange) {
        api.notify('enemyAggro', { enemyId: entity.id });
      }
    }
  }
};
\`\`\`

For pathfinding, the heuristic calculates distance as: $h(n) = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$

\`\`\`mermaid
graph LR
    A[Enemy Entity] --> B[Detect Player]
    B --> C{In Range?}
    C -->|Yes| D[Chase Behavior]
    C -->|No| E[Patrol Behavior]
    D --> F[Update Position]
    E --> F
\`\`\``,
  },
  {
    id: "2023-11-11_canvas",
    title: "Canvas",
    date: "2023-11-11",
    body: `So far, the game engine had used React as the rendering layer. But there's only so much you can do with the DOM. I also wanted the engine to be **render-agnostic**. So I started adding a 2D canvas rendering layer.

The beauty of the entity-based architecture was that rendering became just another system:

\`\`\`javascript
const renderSystem = (state, deltaTime) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  Object.values(state).forEach(entity => {
    if (entity.sprite) {
      ctx.drawImage(entity.sprite, entity.x, entity.y);
    }
  });
};
\`\`\`

Target frame rate: $fps = \\frac{1000ms}{16.67ms} \\approx 60$ frames per second.

\`\`\`mermaid
graph TD
    A[Entity Store] --> B[Canvas Renderer]
    A --> C[React Renderer]
    A --> D[WebGL Renderer]
    B --> E[2D Context]
    C --> F[Virtual DOM]
    D --> G[GPU]
\`\`\``,
  },
  {
    id: "2024-05-28_collision_detection",
    title: "Collision Detection",
    date: "2024-05-28",
    body: `This is where I started losing motivation again. **Collision detection** is a complex topic. You can do AABB, but there's a lot more if you want it to be realistic. A few things scared me in game development, and this was one of them. Also, I was distracted by getting married!

Simple AABB collision:

\`\`\`javascript
const collisionSystem = (state) => {
  const entities = Object.values(state);
  
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      if (checkAABB(entities[i], entities[j])) {
        // Handle collision
      }
    }
  }
};
\`\`\`

For circles, collision occurs when: $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2} < r_1 + r_2$

\`\`\`mermaid
graph TD
    A[Collision System] --> B[Broad Phase]
    B --> C[Spatial Grid]
    C --> D[Narrow Phase]
    D --> E{Colliding?}
    E -->|Yes| F[Resolve]
    E -->|No| G[Skip]
\`\`\``,
  },
  {
    id: "2025-02-14_coding_is_coping",
    title: "Coding Is Coping",
    date: "2025-02-14",
    body: `Right after my wedding, things went south pretty fast. My mother was diagnosed with cancer and died in March. In the meantime, **LLMs started to threaten my relevance** as a developer. But LLMs also made my life a bit easier, boosting my confidence about my engine. So, after a period of burnout, I slowly started coding again. That was probably also a way to cope with what was happening around me.

LLMs helped me see patterns I'd missed:

\`\`\`javascript
// Before: scattered logic
// After: clean composition
const resettable = (type) => ({
  reset(entity, api) {
    Object.assign(entity, entity.initialState);
    type.reset?.(entity, api);
  }
});

const player = [basePlayer, resettable];
\`\`\`

My emotional state as a function: $M(t) = \\alpha \\cdot \\text{progress} - \\beta \\cdot \\text{grief} + \\gamma \\cdot \\text{flow}$

\`\`\`mermaid
graph LR
    A[Grief] --> B[Coding]
    B --> C[Flow State]
    C --> D[Progress]
    D --> E[Renewed Purpose]
    E --> B
\`\`\``,
  },
  {
    id: "2025-07-24_lets_talk",
    title: "Let's Talk",
    date: "2025-07-24",
    body: `A friend of mine, who organizes talks, needed a speaker for his mid-August event. Nobody was supposed to attend since everyone was on vacation; it was just to fill the gap. I proposed the engine, and while **preparing the slides** and a new example for them, I gained so much more interest in what I had done so far.

Created a particle system demo in functional style:

\`\`\`javascript
const types = {
  particle: {
    update(entity, dt) {
      entity.y += entity.velocity * dt;
      entity.velocity += entity.gravity * dt;
      entity.life -= dt;
    }
  }
};

// Spawn 1000 particles
for (let i = 0; i < 1000; i++) {
  store.notify('add', {
    id: \`particle\${i}\`,
    type: 'particle',
    x: Math.random() * 800,
    y: 0,
    velocity: 0,
    gravity: 9.8,
    life: 5
  });
}
\`\`\`

Particle motion follows: $y(t) = y_0 + v_0t + \\frac{1}{2}gt^2$

\`\`\`mermaid
graph TD
    A[Talk Preparation] --> B[Build Demo]
    B --> C[Realize Potential]
    C --> D[Renewed Passion]
    D --> E[Continue Development]
\`\`\``,
  },
  {
    id: "2025-10-05_coding_spree",
    title: "Coding Spree",
    date: "2025-10-05",
    body: `I couldn't stop coding. LLMs gave me the validation and the low-level coding capabilities to write a really cool game engine. I added a **scaffolding tool**, sound and touch support, an entity pool for performance... heck, I even created my own JavaScript superset for vector operations!

IngloriousScript made vector math beautiful:

\`\`\`javascript
// Without IngloriousScript
const newPos = mod(add(position, scale(velocity, dt)), worldSize);

// With IngloriousScript
const newPos = (position + velocity * dt) % worldSize;
\`\`\`

Entity pooling performance gain: $\\text{speedup} = \\frac{t_{\\text{create/destroy}}}{t_{\\text{pool}}} \\approx 3.5x$

\`\`\`mermaid
graph TD
    A[Scaffolding] --> F[Complete Engine]
    B[Sound System] --> F
    C[Touch Support] --> F
    D[Entity Pool] --> F
    E[IngloriousScript] --> F
    F --> G[Epiphany]
\`\`\`

But then I realized something...`,
  },
  {
    id: "2025-10-11_not_only_games",
    title: "Not Only Games",
    date: "2025-10-11",
    body: `...The store was a **perfect fit for webapps too**! What if the Inglorious Store was used as a drop-in replacement for Redux in a React webapp? I started experimenting.

The API was simpler than Redux:

\`\`\`javascript
// Redux
const mapStateToProps = state => ({ 
  todos: state.todos 
});

// Inglorious Store - just works!
import { createStore } from '@inglorious/store';

const types = {
  todoList: {
    addTodo(entity, text) {
      entity.todos.push({ id: Date.now(), text });
    }
  }
};

store.notify('addTodo', 'Buy milk');
\`\`\`

Entity lookup complexity: $O(1)$ vs Redux tree traversal: $O(\\log n)$

\`\`\`mermaid
graph LR
    A[Game Engine Store] --> B[Insight]
    B --> C{Works for Web?}
    C -->|Yes!| D[Redux Alternative]
    D --> E[React Integration]
\`\`\``,
  },
  {
    id: "2025-11-12_not_only_react",
    title: "Not Only React",
    date: "2025-11-12",
    body: `By the end of 2025, I realized that **React was overkill** for entity-based webapps: moving all logic to the store means we don't need lifecycle hooks, not even the virtual DOM! After a bit of scouting, I found out that Google's lit-html was the lightweight renderer I needed.

Full-tree re-rendering with lit-html:

\`\`\`javascript
import { html, mount } from '@inglorious/web';

const types = {
  counter: {
    increment(entity) { entity.value++; },
    
    render(entity, api) {
      return html\`
        <div>
          <p>Count: \${entity.value}</p>
          <button @click=\${() => api.notify('increment')}>
            +1
          </button>
        </div>
      \`;
    }
  }
};
\`\`\`

Bundle size: React ≈ 140KB, lit-html ≈ 10KB, ratio = $\\frac{140}{10} = 14x$ smaller!

\`\`\`mermaid
graph TD
    A[React VDOM] --> B{Too Heavy?}
    B -->|Yes| C[lit-html]
    C --> D[Entity Store]
    D --> E[Full Tree Rerender]
    E --> F[Fast DOM Diff]
\`\`\``,
  },
  {
    id: "2025-12-20_inglorious_web",
    title: "Inglorious Web",
    date: "2025-12-20",
    body: `The **Inglorious Web framework** was born. Yes, framework. Not library. The software had to provide default implementations for the most common developer needs, such as a router, a form, a table, a select, a virtualized list. The only two things missing to make it a framework worth using were charts and SSG/SSR.

Complete framework primitives:

\`\`\`javascript
import { 
  createStore, 
  html, 
  mount 
} from '@inglorious/web';
import { router } from '@inglorious/web/router';
import { form } from '@inglorious/web/form';
import { table } from '@inglorious/web/table';
import { select } from '@inglorious/web/select';
import { list } from '@inglorious/web/list';

const types = { router, form, table, select, list };
const store = createStore({ types, entities });
mount(store, renderApp, root);
\`\`\`

Feature completeness: $C = \\frac{n_{\\text{done}}}{n_{\\text{needed}}} = \\frac{8}{10} = 80\\%$

\`\`\`mermaid
graph TD
    A[Entity Store] --> B[Router]
    A --> C[Form]
    A --> D[Table]
    A --> E[Select]
    A --> F[VirtualList]
    B --> G[Framework]
    C --> G
    D --> G
    E --> G
    F --> G
    G -.->|TODO| H[Charts]
    G -.->|TODO| I[SSG/SSR]
\`\`\``,
  },
  {
    id: "2025-12-31_inglorious_ssx",
    title: "Inglorious SSX",
    date: "2025-12-31",
    body: `I soon realized that Server-Side Rendering is not worth the effort with the Inglorious Web framework. But there's a **better alternative**! It's what I call Server-Side Xecution. The pages are statically generated, then hydration on the client regenerates the templates' structure and adds event handlers. It's basically SSG, but with the Inglorious Store as state manager, it's so simple and surprisingly performant! Even the skeptical Claude said: "You're on the path to glory."

SSX file-based routing:

\`\`\`javascript
// src/pages/index.js
export const index = {
  render(entity, api) {
    return html\`<h1>Welcome to SSX!</h1>\`;
  }
};

// src/pages/posts/_slug.js
export async function staticPaths() {
  const posts = await fetch('/api/posts').then(r => r.json());
  return posts.map(post => ({ 
    params: { slug: post.slug } 
  }));
}

export async function load(entity, page) {
  const post = await fetch(\`/api/posts/\${page.params.slug}\`);
  entity.post = await post.json();
}
\`\`\`

Hydration time: $T_{\\text{hydrate}} = O(n)$ where $n$ = interactive elements, typically < 50ms.

\`\`\`mermaid
graph LR
    A[Build Time] --> B[Static HTML]
    B --> C[Client Loads]
    C --> D[lit-html Hydrates]
    D --> E[Events Attached]
    E --> F[Interactive!]
    \`\`\``,
  },
]

export async function GET(request) {
  const url = new URL(request.url)
  const segments = url.pathname.split("/").filter(Boolean)
  const id = segments[2] // /api/posts/:id

  if (id) {
    const post = data.find((post) => post.id === id)
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 })
    }
    return Response.json(post)
  }

  return Response.json(data)
}
