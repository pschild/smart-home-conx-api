describe('template spec', () => {
  it('passes', () => {
    const now = new Date();

    cy.visit(Cypress.env('hubrey_url'));

    cy.get('p').contains('Letzte Aktualisierung').invoke('text').as('lastUpdate');
    cy.get('p').contains('Nächste Aktualisierung').invoke('text').as('nextUpdate');

    cy.get('.heute').as('heute');
    cy.get('@heute').find('div.custom').invoke('text').as('todayText');
    // cy.get('@heute').find('div.custom img').invoke('attr', 'src').then(src => console.log(src));

    cy.get('.morgen').as('morgen');
    cy.get('@morgen').find('div.custom').invoke('text').as('tomorrowText');

    cy.get('.prognose').as('prognose');
    cy.get('@prognose').find('div.custom').invoke('text').as('prognoseText');

    cy.getMany(['@lastUpdate', '@nextUpdate', '@todayText', '@tomorrowText', '@prognoseText'])
      .then(([lastUpdate, nextUpdate, todayText, tomorrowText, prognoseText]: [string, string, string, string, string]) => {
        cy.writeFile('./result-hubrey.json', {
          crawlTime: now,
          lastUpdate,
          nextUpdate,
          today: todayText.trim().replaceAll('\n', ' '),
          tomorrow: tomorrowText.trim().replaceAll('\n', ' '),
          prognose: prognoseText.trim().replaceAll('\n', ' '),
        });
      });
  });
});
