import './util-commands';
import './bof-commands';

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      getMany(names: string[]): Chainable<any[]>;

      getOrdersOfVisibleWeek(): Chainable<string[]>;
    }
  }
}
