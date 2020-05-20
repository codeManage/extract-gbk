# extract-gbk
* extract-gbk 主要用于提取开发文件中的中文字符串


##### **安装步骤：**
````
npm install extract-gbk -g
````
##### **使用说明：**
* 在对应需要提取的目录中打开命令行窗口,使用extra-gbk 命令行执行提取
```
extract-gbk -p work --configPath /usr/work/config.js
```

##### **extract-gbk 命令行相关参数说明**
```
 -p 基于当前命令行路径指定路径 如：work/expample
 --configPath 指定配置文件的绝对路径  如：/usr/work/config.json
```

##### **config.json 配置文件：**
* config.json配置文件主要用来进行匹配规则自定义，默认匹配模式如下
```
{
    regexp:'*', //默认为空 ，自定义正则 ，优先级高于regexpType
    regexpType:3 ,
        //  1 仅包含中文字符并且可能包含（中文符号或英文字母或数字或换行符）
        //  2 仅包含中文字符
        //  3 仅包含中文字符并且可能包含中文常规符号
        //  4 仅包含中文字符并且可能包含（中文常规符号或换行符）
    matchMode:[
        {
            matchPattern: "\"{VALUE}\"", //匹配中文字符，如："提取中文字符"
            replacePattern: `'{VALUE}'` //替换的模式   如：'提取中文字符'
        }
    ],
    messagePattern : "\"{KEY}\":\"{VALUE}\",",  // message文件键值匹配
    excludeFolder:"",                            //过滤不需要提取的文件夹
    fileExtension:"", //提取文件后缀fileExtension文件
    output:"",//输出路径（绝对路径）;默认当前命令执行目录下的_extra_GB_message_source中
    isCover:true //默认true,是否重写原始文件
}
```

