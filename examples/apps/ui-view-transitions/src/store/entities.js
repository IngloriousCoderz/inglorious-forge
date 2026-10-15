export const entities = {
  router: {
    type: "Router",
  },

  articleList: {
    type: "ArticleList",
    articles: [
      {
        id: "1",
        title: "Pushing a screen",
        summary:
          "A push moves the index forward, so the page slides in from the right.",
        body: "The Router stamps an index into every history entry as it navigates. withTransitions reads that index back and tags the transition `forward`, and the stylesheet in @inglorious/ui turns the tag into a slide from the right.",
      },
      {
        id: "2",
        title: "Popping a screen",
        summary:
          "A traversal lowers the index, so the page slides in from the left.",
        body: "Browser back and forward are traversals, which the same index comparison reads as `back` or `forward` without anyone telling the transition which one it is. The old page slides out the other way at the same time.",
      },
      {
        id: "3",
        title: "Replacing in place",
        summary:
          "A replacement keeps the index, so the page cross-fades instead of sliding.",
        body: "When nothing is being pushed onto the stack there is no direction to slide towards, so the page fades. Everything behind it, including your scroll position, stays exactly where it was.",
      },
      {
        id: "4",
        title: "Asking for less motion",
        summary:
          "The animations sit behind prefers-reduced-motion: no-preference.",
        body: "The browser does not switch your own animations off when reduced motion is set, it only softens its own default. These rules are written out for that, so the whole sequence turns into an instant swap when the preference says so.",
      },
    ],
  },

  articleDetail: {
    type: "ArticleDetail",
  },
}
