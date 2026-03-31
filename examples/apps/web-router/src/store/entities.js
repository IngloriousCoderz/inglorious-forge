export const entities = {
  router: {
    type: "Router",
  },

  userList: {
    type: "UserList",
    users: [
      { id: "1", name: "Alice", email: "alice@example.com" },
      { id: "2", name: "Bob", email: "bob@example.com" },
    ],
  },

  userDetail: {
    type: "UserDetail",
  },

  postList: {
    type: "PostList",
    posts: [],
  },

  lazyEntity: {
    type: "LazyEntity",
    message: "Hi!",
  },

  lazyData: {
    type: "LazyData",
    posts: [],
  },

  adminPage: {
    type: "AdminPage",
  },

  loginPage: {
    type: "LoginPage",
    username: "",
    password: "",
  },
}
