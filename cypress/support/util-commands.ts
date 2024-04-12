/**
 * Verwendung: cy.getMany(['@foo', '@bar']).then(([foo, bar]) => { ... });
 */
Cypress.Commands.add('getMany', (names: string[]): Cypress.Chainable<any[]> => {
  const values: any[] = [];
  for (const arg of names) {
    cy.get(arg).then((value) => values.push(value));
  }
  return cy.wrap(values);
});
