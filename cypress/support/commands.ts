import './util-commands';
import './mema-commands';

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      getMany(names: string[]): Chainable<any[]>;

      getOrdersOfVisibleWeek(): Chainable<string[]>;
    }
  }
}
