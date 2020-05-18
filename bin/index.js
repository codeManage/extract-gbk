#!/usr/bin/env node
/*
 * @Author: xmg
 * @Date: 2020/03/11
 * @Description: extra GB2312
 */
const program = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const Scan = require('../scan.js');
const PWD = process.cwd()
const fs = require('fs');

program
    .version('1.0.0')
    .option('-p, --path <path>', '基于当前路径指定路径')
    .option('--configPath <setConfigPath>', '指定配置文件绝对路径path')
    .action(async function () {
        let path = program.path||'',
            configPath = program.configPath;
         await handle({path,configPath})

    })
    .parse(process.argv);

    async function handle({path,configPath}) {
        let config= {};
        if(configPath){
            let configData = fs.readFileSync(configPath, 'utf-8');
                if(configData){
                    try {
                        configData = JSON.parse(configData);
                    } catch (e) {
                        return e
                    }
                    if(typeof configData === 'object' && !configData.length){
                        Object.assign(config,configData)
                    }
                }
        }
        config.path = PWD+'/'+path;
        let prompt = await inquirer.prompt([{
            type: 'confirm',
            name: 'allow',
            message: chalk.yellow(`是否在${config.path}执行中文字符提取?`),
            default: false
        }]);
       
        if (prompt.allow) {
            Scan(config)
        }
    }