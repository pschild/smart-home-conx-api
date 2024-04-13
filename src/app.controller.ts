import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { exec } from 'child_process';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  async getHello(): Promise<any> {
    const { stdout } = await sh(`cat /proc/1/cgroup | grep 'docker/' | tail -1`);
    let sum;
    for (let i = 0; i < 523123e4; i++) {
      sum += i / 2323 - 33;
    }
    return { id: stdout, result: sum };
  }

  @Get('hello1')
  async getHello1(): Promise<any> {
    const { stdout } = await sh(`cat /proc/1/cgroup | grep 'docker/' | tail -1`);
    return { id: stdout, result: this.appService.getHello() };
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
