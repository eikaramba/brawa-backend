module.exports = {
  definition: `
    type Self {
      id: ID
      email: String
      username: String
      role: UsersPermissionsMeRole
    }
  `,
  query: `
      self: Self
  `,
  resolver: {
      Query: {
          self: {
              resolver: 'plugins::users-permissions.user.me'
          },
      },
  }
};