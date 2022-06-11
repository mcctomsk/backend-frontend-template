#!/usr/bin/env node
import Renamer from "renamer";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import replace from "node-replace";
import {
  camelCase,
  capitalCase,
  constantCase,
  paramCase,
  snakeCase,
} from "change-case";

const args = yargs(hideBin(process.argv))
  .version("0.1")
  .option("name", {
    alias: "n",
    type: "string",
    description: "Name of the project (e.g. StudyApp)",
  })
  .demandOption(["name"])
  .help().argv;

const projectName = args.name;
console.log(`ProjectName: ${projectName}`);
const frontendPortNumber = Math.round(Math.random() * 1000) + 3100;
console.log(`FrontendPortNumber: ${frontendPortNumber}`);
const backendPortNumber = Math.round(Math.random() * 1000) + 49000;
console.log(`BackendPortNumber: ${backendPortNumber}`);

const replacements = [
  { find: "TemplateApp", replace: projectName },
  { find: "templateapp", replace: projectName.toLowerCase() },
  {
    find: "templateApp",
    replace:
      camelCase(projectName) /* converts 'ProjectName' to 'projectName'*/,
  },
  {
    find: "template-app",
    replace:
      paramCase(projectName) /* converts 'projectName' to 'project-name' */,
  },
  {
    find: "template_app",
    replace:
      snakeCase(projectName) /* converts 'projectName' to 'project-name' */,
  },
  {
    find: "Template App",
    replace:
      capitalCase(projectName) /* converts 'ProjectName' to 'Project Name' */,
  },
  {
    find: "TEMPLATE_APP",
    replace:
      constantCase(projectName) /* converts 'ProjectName' to 'Project Name' */,
  },
];

await changeFrontendPortNumber(frontendPortNumber);
await changeBackendPortNumber(backendPortNumber);
await changePasswordsInAppsettings();

await renameFiles(replacements);
await replaceInFiles(replacements);

async function replaceInFiles(replacements) {
  for (const replacement of replacements) {
    replace({
      regex: replacement.find,
      replacement: replacement.replace,
      paths: ["./"],
      exclude: "node_modules",
      recursive: true,
      silent: true,
    });
  }
}

async function renameFiles(replacements) {
  const renamer = new Renamer();
  for (const replacement of replacements) {
    await renamer.rename({
      files: ["!(node_modules)/**/*"],
      find: replacement.find,
      replace: replacement.replace,
    });
  }
}

function changeFrontendPortNumber(port) {
  replace({
    regex: /port: \d+/g,
    replacement: `port: ${port}`,
    paths: ["./frontend/vite.config.ts"],
    silent: true,
    recursive: true,
  });
  replace({
    regex: /<SpaProxyServerUrl>https:\/\/localhost:\d+<\/SpaProxyServerUrl>/,
    replacement: `<SpaProxyServerUrl>https://localhost:${port}</SpaProxyServerUrl>`,
    paths: ["./webapi/src/MccSoft.TemplateApp.App/MccSoft.TemplateApp.App.csproj"],
    silent: true,
    recursive: true,

  });
  replace({
    regex: /https:\/\/localhost:\d+\//g,
    replacement: `https://localhost:${port}/`,
    paths: ["./webapi/src/MccSoft.TemplateApp.App/appsettings.json"],
    silent: true,
    recursive: true,
  });

}

function changeBackendPortNumber(port) {
  replace({
    regex: /target: 'https:\/\/localhost:(\d+)',/g,
    replacement: `target: 'https://localhost:${port}',`,
    paths: [
      "./frontend/vite.config.ts",
    ],
    silent: true,
  });
  replace({
    regex: /"Url": "http:\/\/\*:\d+"/g,
    replacement: `"Url": "http://*:${port + 1}"`,
    paths: [
      "./webapi/src/MccSoft.TemplateApp.App/appsettings.Development.json",
    ],
    silent: true,
  });
  replace({
    regex: /"Url": "https:\/\/\*:\d+"/g,
    replacement: `"Url": "https://*:${port}"`,
    paths: [
      "./webapi/src/MccSoft.TemplateApp.App/appsettings.Development.json",
    ],
    silent: true,
  });
  replace({
    regex: /"proxy": "http:\/\/localhost:\d+"/g,
    replacement: `"proxy": "http://localhost:${port}"`,
    paths: ["./frontend/package.json"],
    silent: true,
  });
  replace({
    regex: /\/input:http:\/\/localhost:\d+/g,
    replacement: `/input:http://localhost:${port}`,
    paths: ["./frontend/package.json"],
    silent: true,
  });
}

function changePasswordsInAppsettings() {
  replace({
    regex: /"DashboardPassword": "(.*?)"/,
    replacement: `"DashboardPassword": "${generatePassword(12)}"`,
    paths: ["./webapi/src/MccSoft.TemplateApp.App/appsettings.json"],
    silent: true,
  });
  replace({
    regex: /("DefaultUser".*?"Password": ").*?"/gims,
    replacement: `$1${generatePassword(12)}"`,
    paths: ["./webapi/src/MccSoft.TemplateApp.App/appsettings.json"],
    silent: true,
  });

}

function generatePassword(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
  }
  return result;
}
