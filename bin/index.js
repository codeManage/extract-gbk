#!/usr/bin/env node
/*
 * @Author: xmg
 * @Date: 2020/05/21
 * @Description: extra GBK
 */
const program = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const PWD = process.cwd()
const fs = require('fs');
const PATH = require('path');
const Scan = require('../scan.js');

//当前项目的根目录
const currentRoot = PATH.join(__dirname, '../');
const CustomConfigPath = PATH.join(currentRoot, 'customConfig.json');
program
    .version('2.0.0')
    .arguments('<cmd> [path]')
    .action(async function (cmd,path) {
        switch (cmd) {
            case 'run':
                await handle({path});
                break;
            case 'resetConfig'://重置config,移除自定义config
                if(fs.existsSync(CustomConfigPath)){
                    fs.unlinkSync(CustomConfigPath);
                }
                break;
            case 'setConfig'://设置配置文件,指定绝对路径path获取配置信息
                await readConfig(path,(configData)=>{
                    fs.writeFileSync(CustomConfigPath, JSON.stringify(configData), {'flag': 'w'});
                })
                break;
            default:
                break;
        }
    })
    .parse(process.argv);

    async function handle({path=''}) {
        let config = await readConfig(CustomConfigPath);
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

    async function readConfig(path,callback){
        let config= {};
        if(path && fs.existsSync(path)){
            let configData =  fs.readFileSync(path, 'utf-8');
            if(configData){
                try {
                    configData = JSON.parse(configData);
                } catch (e) {
                    return e
                }
                if(typeof configData === 'object' && !configData.length){
                    Object.assign(config,configData);
                    if(callback && typeof callback === 'function'){
                        callback(config)
                    }
                }
            }
        }
        return config
    }