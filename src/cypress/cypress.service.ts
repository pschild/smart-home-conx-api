import { Injectable } from '@nestjs/common';
import { run } from 'cypress';
import { rmSync } from 'fs';
import { readFile } from 'fs/promises';
import { Observable, from, switchMap, tap } from 'rxjs';

@Injectable()
export class CypressService {

  private static RESULT_FILE_PREFIX = 'result-';

  executeCypress(name: string): Observable<any> {
    rmSync(`./${CypressService.RESULT_FILE_PREFIX}${name}.json`, { force: true });

    return from(run({
      browser: 'chrome',
      spec: `./cypress/e2e/${name}.cy.js`,
    })).pipe(
      tap((result: any) => { // Typing of Cypress is not nice :(
        if (result.status === 'failed') {
          throw new Error(`Cypress test could not be executed: ${result.message || JSON.stringify(result)}`);
        }
        if (result.totalFailed > 0) {
          throw new Error(`Cypress test executed but failed: ${result.runs.map(run => run.tests.map(test => test.displayError))}`);
        }
      }),
      switchMap(() => from(readFile(`./${CypressService.RESULT_FILE_PREFIX}${name}.json`, 'utf8'))),
    );
  }

}
