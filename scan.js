/*
 * @Author: xmg
 * @Date: 2020/03/11
 * @Description: extra GB2312
 */
const fs = require('fs');
const transliteration = require('transliteration');
const uuid = require('uuid');
const PATH = require('path');
const JOIN = PATH.join;
//中文常规符号
const chineseSymb = `\uff08\uff09\u3008\u3009\u300a\u300b\u300c\u300d\u300e\u300f\ufe43\ufe44\u3014\u3015\u2014\u2026\uff5e\ufe4f\uffe5\u3001\u3010\u3011\uff0c\u3002\uff1f\uff01\uff1a\uff1b\u201c\u201d\u2018\u2019`
const chinese = `\u4e00-\u9fa5`;
const regexpMap = {
    1:`([${chineseSymb}\\w\\n])*([${chinese}])+([${chineseSymb}${chinese}\\w\\n])*`,//包含中文字符并且可能包含（中文符号或英文字母或数字或换行符）
    2:`([${chinese}])+`,//只包含中文字符
    3:`([${chineseSymb}])*([${chinese}${chineseSymb}])+([${chineseSymb}])*`,//只包含中文字符并且可能包含中文常规符号
    4:`([\\n\\s${chineseSymb}])*([${chinese}])+([${chineseSymb}\\n\\s])*`,//包含中文字符并且可能包含（中文常规符号或换行符）
};
class ExtraMessage {
    constructor({
                    path,//入口路径
                    regexp,//自定义正则 ，优先级高于regexpType
                    regexpType= 1 ,//默认内置的提取正则，类型可查看regexpMap
                    matchMode=[
                        {
                            matchPattern: `"{VALUE}"`,//通过regexp 匹配到的 {VALUE} 中文字符
                            replacePattern: `'{VALUE}'`// 替换的模式   如："提取" => '提取'
                        }
                    ],
                    messagePattern = `"{KEY}":"{VALUE}",`,
                    excludeFolder,//过滤不需要提取的文件及文件夹
                    fileExtension,//提取文件后缀fileExtension文件
                    output,//输出路径（绝对路径）默认当前命令执行目录下的_extra_GB_message_source中
                    isCover=false//是否覆盖原始文件
                }) {
        this.excludeFolder = excludeFolder;
        this.fileExtension = fileExtension;
        this.regexp = regexp || regexpMap[regexpType];
        this.matchMode = matchMode;
        this.messagePattern = messagePattern;
        this.prevProcessPath = JOIN(path,'../');
        this.output = output || JOIN( this.prevProcessPath, '_extra_GB_message_source');
        this.isCover = isCover;
        if(path){
            this.main(path)
        }
    }

    async readFile({filePath, relativePath, fileName}) {
        let _this = this;
        let data = fs.readFileSync(filePath, 'utf-8');
        let reg = _this.fileExtension && _this.fileExtension.length ? RegExp(_this.fileExtension.map(file => `(\\.${file})`).split('|') + '$') : false;
        if ((reg && reg.test(fileName)) || !reg) {//类型文件参与提取
            await _this.writeFileHandle({relativePath, data, fileName})
            return data;
        }
        return true;
    }

//数据写入预处理
    async writeFileHandle({relativePath, data, fileName}) {
        let _this = this,
            messageResoucesData = "",
            reg = '',
            matchPatterRL = '',
            replaceData=data,
            matchMode =_this.matchMode;
            //循环匹配
        matchMode.map(item=>{
            reg = RegExp(`${item.matchPattern.replace(/{VALUE}/, _this.regexp)}`, 'gmi');
            matchPatterRL = item.matchPattern.split('{VALUE}');
            replaceData = replaceData.replace(reg, function (val) {
                let mN =  _this.mdKey(val, fileName);
                //移除左右闭合符号
                let valData = val.replace(matchPatterRL[0], '').replace(matchPatterRL[1], '')
                messageResoucesData += _this.messagePattern.replace(/{KEY}/, mN).replace(/{VALUE}/, valData) + '\n';
                return item.replacePattern.replace(/{VALUE}/, mN)
            });
        })

        if (messageResoucesData) {
            //覆盖原始文件
            _this.isCover ? await _this.writeFile(JOIN(_this.prevProcessPath , relativePath), fileName, replaceData):null;
            //生成新文件到输出目录(output)中
                await _this.writeFile(JOIN(_this.output, relativePath), fileName, replaceData)
            //源文件提取内容生成对应的文件到输出目录(output)中
                await _this.writeFile(JOIN(_this.output,'message',relativePath) , fileName, messageResoucesData,'a')
            //生成本次提取汇总到message文件到输出目录(output)中
                await _this.writeFile(_this.output, 'message.json', messageResoucesData, 'a')
        }
        return true
    }

    async writeFile(outhPath, fileName, data, r) {
        if (data) {
            //递归生成目录文件
            fs.mkdirSync(PATH.dirname(JOIN(outhPath, fileName)),{ recursive: true })
            //写入文件
            await fs.writeFileSync(JOIN(outhPath, fileName), data, {'flag': r || 'w'});
        }
        return true;
    }

    mdKey(str, fileName) {//生成key
        return transliteration.slugify(
            str,
            {lowercase: true, separator: '_'}
        ).substring(0, 5) + (uuid.v4().substring(7, 22)).replace(/\-/g, '');
    }

    async removeBlankDir(path){
        let _this =this;
        if(fs.existsSync(path)){
            let files=  fs.readdirSync(path);
            if(files.length){
                files.map((val,index) => {
                    let fPath=JOIN(path,val);
                    let stats=  fs.statSync(fPath);
                    if( stats.isDirectory()){
                        _this.removeBlankDir(fPath)
                    }
                })
            }else{
                fs.rmdirSync(path);
            }
        }
        return true
    }

    //读取files
    async convert (path) {
        let _this = this;
        let files = fs.readdirSync(path);
        files.map(async (val, index) => {
            let fPath = JOIN(path, val);
            //文件描述
            let stats = fs.statSync(fPath);
            let regFolder = _this.excludeFolder && _this.excludeFolder.length ? new RegExp(_this.excludeFolder.map(folder => `(${folder})`).join('|')) : false;
            //目录进行递归
            if (stats.isDirectory() && (!regFolder || (regFolder && !regFolder.test(fPath)))) {
                await _this.convert(fPath);
            }
            //文件进行匹配替换操作
            if (stats.isFile() ) {
                let reg = new RegExp(_this.prevProcessPath, 'g');
                await this.readFile({
                    filePath: fPath,//文件的绝对路径
                    relativePath: path.replace(reg, ''),//相对路径
                    fileName: val,//文件名
                });
            };
        })
    }

    async main(path){
        await this.convert(path)
        for(let i=1;i<10;i++){//默认移除10级空目录
            await this.removeBlankDir(this.output)
        }
        return true;
    }

}

module.exports = function({
    path,
    excludeFolder,
    fileExtension,
    matchMode=[
        {
            matchPattern:`'{VALUE}'`,
            replacePattern:`'{VALUE}'`,
        },
        {
            matchPattern:`"{VALUE}"`,
            replacePattern:`'{VALUE}'`,
        }
    ],
    messagePattern=`"{KEY}":"{VALUE}",`,
    regexpType=1,
    isCover=true,
}) {
    new ExtraMessage({
    path,
    excludeFolder,
    fileExtension,
    matchMode,
    messagePattern,
    regexpType,
    isCover
})}
