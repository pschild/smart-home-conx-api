describe('template spec', () => {
  it('passes', () => {
    let startDateTime;
    let endDateTime;
    const now = new Date();
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false;
    });

    cy.visit(Cypress.env('bof_url'));
    cy.get('#usercentrics-root').shadow().find('button').contains('Alles ablehnen').click();
    cy.get('#j_username').then(el => el.val(Cypress.env('bof_username')));
    cy.get('#j_password').then(el => el.val(Cypress.env('bof_password')));
    cy.get('#j_password').type('{enter}');
    cy.get('button[type=submit]').click();
    cy.get('.nav-link > .icon-ui_user').trigger('mouseover');
    cy.get('#dropdown-login .visite').should('be.visible');
    cy.get('#dropdown-login .visite').invoke('text')
      .then(text => {
        // example: "                 xyz: 26. März 2024,\n16:00 – 18:00 Uhr                       "
        const withoutLinebreaksAndSpaces = text.trim().replace('\n', '').replaceAll('  ', '');
        // example: "xyz: 26. März 2024, 16:00 – 18:00 Uhr"
        const dateMatch = withoutLinebreaksAndSpaces.match(/(\d+). (Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember) (\d{4})/);
        if (!dateMatch) {
          throw new Error(`Could not parse date: "${withoutLinebreaksAndSpaces}"`);
        }
        const [_, day, monthString, year] = dateMatch;
        const month = monthNames.indexOf(monthString) + 1;

        const timeMatches = withoutLinebreaksAndSpaces.match(/(\d{2}):(\d{2})/g);
        if (!timeMatches) {
          throw new Error(`Could not parse times: "${withoutLinebreaksAndSpaces}"`);
        }
        const [startTime, endTime] = timeMatches;
        const [startHour, startMinute] = startTime.split(':');
        const [endHour, endMinute] = endTime.split(':');

        startDateTime = new Date(+year, month - 1, +day, +startHour, +startMinute);
        endDateTime = new Date(+year, month - 1, +day, +endHour, +endMinute);
      })
      .then(() => cy.writeFile('./result-bof.json', { crawlTime: now, startDateTime, endDateTime }));
  });
});
