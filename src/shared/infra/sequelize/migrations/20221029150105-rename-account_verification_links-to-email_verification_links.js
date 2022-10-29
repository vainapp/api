module.exports = {
  up: (queryInterface) =>
    queryInterface.renameTable(
      'account_verification_links',
      'email_verification_links'
    ),

  down: (queryInterface) => {
    queryInterface.renameTable(
      'email_verification_links',
      'account_verification_links'
    )
  },
}
