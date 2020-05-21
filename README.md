# extract-gbk
* extract-gbk 主要用于提取开发文件中的中文字符串，支持自定义提取、替换规则以及生成对应的资源文件格式

### **安装步骤：**
````
npm install extract-gbk -g
````
### **使用说明：**
* 在对应需要提取的目行窗录中打开命令口,使用extra-gbk 命令行执行提取
```
//设置提取规则参考下面config.json文件说明（需要管理员权限）
extract-gbk setConfig /usr/work/config.json
 
//重置config.json 为默认
extract-gbk resetConfig

//提取目录当前命令行所执行目录下的/work/abc
extract-gbk run work/abc
```

### **config.json 配置文件：**
* config.json配置文件主要用来进行匹配规则自定义，默认匹配替换模式如下
###### 注：以下{KEY}、{VALUE}为系统固定匹配标识不可变更
```
{
    "regexp":'*', //默认为空，自定义正则优先级高于regexpType
    "regexpType":1 ,
        //  1 包含中文汉字并且可能包含（中文符号|英文字母|英文常规符号|数字|换行符|空白符）
        //  2 仅包含中文汉字
        //  3 只包含中文汉字并且可能包含(中文常规符号|空白符)
        //  4 包含中文汉字并且可能包含（中文常规符号|换行符|空白符）
    "matchMode":[
        {
            matchPattern: "\"{VALUE}\"", //匹配中文字符，如："提取中文字符"
            replacePattern: "'{VALUE}'" //替换的模式   如：'提取中文字符'
        }
    ],
    "messagePattern" : "\"{KEY}\":\"{VALUE}\",",  // message文件键值匹配
    "excludeFolder":"",                            //过滤不需要提取的文件夹
    "fileExtension":"", //提取文件后缀fileExtension文件
    "output":"",//输出路径（绝对路径）;默认当前命令执行目录下的_extra_GB_message_source中
    "isCover":true //默认true,是否重写原始文件
}
```

