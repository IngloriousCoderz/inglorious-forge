export const entities = {
  router: { type: "Router" },

  inbox: {
    type: "Inbox",
    isRefreshing: false,
    isComposing: false,
    draft: "",
    menuFor: null,
    deleted: null,
    nextId: 5,
    messages: [
      {
        id: 1,
        from: "Ada",
        subject: "Pull me down",
        body: "Drag this list down from the top and let go past the line: it refreshes, and on Android or in the native app you feel a tick when letting go would refresh.",
        isUnread: true,
      },
      {
        id: 2,
        from: "Grace",
        subject: "Tap the dots",
        body: "The ⋯ button opens an action sheet. Drag it down by its handle or flick it away to close it.",
        isUnread: true,
      },
      {
        id: 3,
        from: "Linus",
        subject: "Write something",
        body: "The pencil opens a sheet with a text box. The sheet rises above the keyboard, and so does the snackbar when you save a draft.",
        isUnread: false,
      },
      {
        id: 4,
        from: "Margaret",
        subject: "Open me, then go back",
        body: "Pages slide in when you open them and out when you go back, with the browser's back button, the iOS edge swipe or Android's back gesture.",
        isUnread: false,
      },
    ],
  },

  message: { type: "Message" },
  haptics: { type: "HapticsPage" },
  settings: { type: "Settings", theme: "ios-26", isDark: false },
  notice: { type: "Notice", message: null, canUndo: false, shownAt: 0 },
  notFound: { type: "NotFound" },
}
