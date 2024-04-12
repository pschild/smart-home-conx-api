describe('template spec', () => {
  it('passes', () => {
    let balance;
    let daysWithOrder = [];
    const now = new Date();

    cy.visit(Cypress.env('mema_login_url'));
    cy.get('#tbxEinrichtung').type(Cypress.env('mema_einrichtung'));
    cy.get('#tbxBenutzername').type(Cypress.env('mema_username'));
    cy.get('#tbxKennwort').type(Cypress.env('mema_password'));
    cy.get('#btnLogin').click();

    cy.visit(Cypress.env('mema_order_url'));
    cy.get('#lblKontostand').should('be.visible');
    cy.get('#lblKontostand').invoke('text')
      .then(text => {
        const euroRaw = text.match(/(\d+,\d+)/);
        balance = euroRaw ? parseFloat(euroRaw[0].replace(',', '.')) : undefined;
      })
      .then(() => cy.getOrdersOfVisibleWeek())
      .then(orders => daysWithOrder = [...daysWithOrder, ...orders])
      .then(() => cy.get('#btnVor').click())
      .then(() => cy.getOrdersOfVisibleWeek())
      .then(orders => daysWithOrder = [...daysWithOrder, ...orders])
      .then(() => cy.writeFile('./result-mema.json', { crawlTime: now, balance, daysWithOrder }));
  });
});
