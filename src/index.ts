#!/usr/bin/env node
// import shell from 'shelljs';
import fs from 'fs';
import util from 'util';
import glob from 'glob';
import path from 'path';
import inquirer from 'inquirer';
const ncp = util.promisify(require('ncp').ncp);

// import fs from 'fs';
// import path from 'path';
import { Configurations, Profiler } from './types';

export const questioner = async () => {
  const answers = await inquirer.prompt<Configurations>([
    {
      name: 'name',
      type: 'input',
      default: 'host',
      message: 'Ingresa el nombre:',
    },
    {
      name: 'port',
      type: 'number',
      default: 8080,
      message: 'Ingresa el puero:',
    },
    {
      name: 'dbPort',
      type: 'number',
      default: 3306,
      message: 'Ingresa el puerto de la base de datos:',
    },
    {
      name: 'author',
      type: 'input',
      default: 'unknown',
      message: 'Nombre del author:',
    },
  ]);
  console.log(answers);
  AppCreator.create(answers).catch(console.error);
};

export class AppCreator {
  static async create(configs: Configurations) {
    const profiler = AppCreator.getProfiler(configs);

    await ncp(path.join(__dirname, `../templates/express`), configs.name);

    AppCreator.renameFile(configs.name, 'gitignore', '.gitignore');
    AppCreator.renameFile(configs.name, 'env', '.env');
    AppCreator.template(configs.name + '/.env', profiler);

    glob.sync(`${configs.name}/**/*`).forEach(file => {
      if (fs.lstatSync(file).isFile()) AppCreator.template(file, profiler);
    });
  }

  static renameFile(filename: string, oldName: string, newName: string) {
    if (fs.existsSync(path.normalize(`${filename}/${oldName}`))) {
      fs.renameSync(
        path.normalize(`${filename}/${oldName}`),
        path.normalize(`${filename}/${newName}`)
      );
    }
  }

  static template(filename: string, profiler: Profiler) {
    const content = fs.readFileSync(filename, 'utf8').toString();
    const template = Object.entries(profiler).reduce((acc, [key, value]) => {
      return acc.replace(
        new RegExp(`(\{\{${key}\}\}|\{\{ ${key} \}\})`, 'g'),
        value?.toString() ?? ''
      );
    }, content);
    fs.writeFileSync(filename, template);
  }
  static getProfiler(configs: Configurations): Profiler {
    return {
      NAME: configs.name,
      AUTHOR: configs.author,
      PORT: configs.port || 3000,
      DATABASE_PORT: configs.dbPort,
    };
  }
}

questioner().then(() => {});
