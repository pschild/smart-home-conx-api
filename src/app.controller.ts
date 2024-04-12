import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { exec } from 'child_process';
import { run } from 'cypress';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  async getHello(): Promise<string> {
    const { stdout } = await sh(`cat /proc/1/cgroup | grep 'docker/' | tail -1`);
    console.log(stdout);
    let sum;
    for (let i = 0; i < 523123e4; i++) {
      sum += i / 2323 - 33;
    }
    return sum;
  }

  @Get('hello1')
  async getHello1(): Promise<string> {
    const { stdout } = await sh(`cat /proc/1/cgroup | grep 'docker/' | tail -1`);
    console.log(stdout);
    return this.appService.getHello();
  }

  @Get('cy')
  async cy(): Promise<any> {
    const result = await run({
      browser: 'chrome',
      spec: './cypress/e2e/mema.cy.js',
    });
    return result;
  }
}

/**
 * Execute simple shell command (async wrapper).
 * @param {String} cmd
 * @return {Object} { stdout: String, stderr: String }
 */
async function sh(cmd): Promise<{ stdout: string; stderr: string }> {
  return new Promise(function (resolve, reject) {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}
