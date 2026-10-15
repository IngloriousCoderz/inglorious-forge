import "./style.css"
import "@inglorious/ui/base.css"
import "@inglorious/ui/themes/bootstrap.css"
import "@inglorious/ui/container.css"
import "@inglorious/ui/app-bar.css"
import "@inglorious/ui/card.css"
import "@inglorious/ui/button.css"
import "@inglorious/ui/typography.css"
import "@inglorious/ui/view-transitions.css"

import { withTransitions } from "@inglorious/ui/view-transitions"
import { mount } from "@inglorious/web"

import { app } from "./app.js"
import { store } from "./store/index.js"

/* The wrapper is what turns the render that follows a navigation into a view
   transition, tagged with the direction it navigated in. Drop it and the app
   navigates instantly; nothing else in the wiring changes. */
mount(withTransitions(store), app.render, document.getElementById("root"))
