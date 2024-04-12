Cypress.Commands.add('getOrdersOfVisibleWeek', () => {
  const orderIndexList = [];
  const daysWithOrder = [];
  return cy.get('table.dataform > tbody > tr').children('td')
    .each(($el, index) => {
      if ($el.hasClass('tdSelected')) {
        orderIndexList.push(index);
      }
    })
    .then(() => {
      return cy.get('table.dataform > thead > tr').children('th')
        .each(($el, index) => {
          if (orderIndexList.includes(index)) {
            daysWithOrder.push($el.text());
          }
        });
    })
    .then(() => cy.wrap(daysWithOrder));
});