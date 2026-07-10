import { createStore } from "@inglorious/store"
import { Button } from "@inglorious/ui/button"
import { Checkbox } from "@inglorious/ui/checkbox"
import { Input } from "@inglorious/ui/input"
import { Slider } from "@inglorious/ui/slider"
import { Switch } from "@inglorious/ui/switch"
import { ElementSize } from "@inglorious/web/element-size"

import { Board } from "./board.js"
import { entities } from "./entities.js"
import { middlewares } from "./middlewares.js"

export const store = createStore({
  types: { Board, Button, Checkbox, Switch, Slider, Input, ElementSize },
  entities,
  middlewares,
})
