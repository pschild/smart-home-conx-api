describe('template spec', () => {
  it('passes', () => {
    cy.viewport(1600, 700);

    cy.intercept('**/api/station-details/graph/v2**').as('req');

    cy.visit(Cypress.env('cleta_url'));
    cy.get('#sp_message_container_1068432').invoke('remove');
    cy.get('html').invoke('removeAttr', 'class');

    cy.wrap([0, 1, 2, 3, 4]).each((num: number) => {
      cy.get('#main-column-container > a').eq(num).as('el');
      cy.get('@el').find('.fuel-station-location-name').then(el => console.log(el.text()));
      cy.get('@el').find('.fuel-station-location-street').then(el => console.log(el.text()));
      cy.get('@el').find('.fuel-station-location-city').then(el => console.log(el.text()));
      cy.get('@el').trigger('mouseover');
      cy.wait('@req').its('response.body.graphs').then(console.log);
    });
  });
});
