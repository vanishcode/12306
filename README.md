# 用Node.js实现余票查询并用邮件通知
## 因为自己在学校还有些事情，不知道具体哪天回家，于是就自己写了一个监控的小程序

## 一.功能：
### 命令行输入火车站名和日期，修改查询周期(定时器时间)，即可实现周期性的余票查询并用邮件通知

## 二.流程概述
### 1.命令行输入信息
### 2.利用信息，发起https请求，查询余票信息
### 3.使用nodemailer模块来发送邮件

## 三.坑*
### 没想到看着挺简单的一个东西，踩了不少坑。现在分享一下
### 1.需要使用readline模块来实现信息输入
```
// 引入readline模块
var readline = require('readline');

//创建readline接口实例
var  rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout
});

// question方法
rl.question("你叫什么？",function(answer){
    console.log("名字是："+answer);
    // 不加close，则不会结束
    rl.close();
});

// close事件监听
rl.on("close", function(){
   // 结束程序
    process.exit(0);
});
```
#### 这个rl.question方法只有一个参数，但是日期，始发站和终点站要三个参数，我是把这个方法嵌套使用的，就像这样：
```
l.question('日期:\n', (date) => {
    rl.question('始发站:\n', (start) => {
        rl.question('终点站:\n', (end) => {
``` 
#### 因为还是新手，这个模块不怎么会用，不知道这么做是不是做错了*
### 2.12306接口
```
/otn/leftTicket/queryA?leftTicketDTO.train_date=' + date + '&leftTicketDTO.from_station=' + startcode + '&leftTicketDTO.to_station=' + endcode + '&purpose_codes=ADULT';
```
当我们在12306上点击查询后，接口URL是这样的，打开浏览器，看一下包的里面就知道了(检查->Network->query)
### 3.知道了接口之后，就是自己在程序里面伪造浏览器请求，这又里面有几个坑
#### (1)12306证书问题
 https://www.zhihu.com/question/19974739/answer/20675855
 ![这里写图片描述](http://img.blog.csdn.net/20170114163657848?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvU0Z0ZWM=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
 ![这里写图片描述](http://img.blog.csdn.net/20170114163716915?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvU0Z0ZWM=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
#### 如果是正常浏览器访问，则需要安装12306的证书，node平时还是使用http的时候多，并且也没什么卵证书，那么node.js里应该怎样发起一个使用证书的https请求呢？
#### 其实有好几种方法。其中一种，https模块已经内置了使用证书选项
#### 证书里面
 ```
 -----BEGIN CERTIFICATE-----
MIICmjCCAgOgAwIBAgIIbyZr5/jKH6QwDQYJKoZIhvcNAQEFBQAwRzELMAkGA1UE
BhMCQ04xKTAnBgNVBAoNpbm9yYWlsIENlcnRpZmljYXRpb24gQXV0aG9yaXR5
MQ0wCwYDVQQDEwRTUkNBMB4XDTA5MDUyNTA2NTYwMFoXDTI5MDUyMDA2NTYwMFow
RzELMAkGA1UEBhMCQ04xKTAnBgNVBAoTIFNpbm9yYWlsIENlcnRpZmljYXRpb24g
QXV0aG9yaXR5MQ0wCwYDVQQX2K/eZRWFfnuk8e5jKDH+gCb29bSo
tqPqTbxXWPxIOz8EjyUO3bfR5pQ8ovNTOlks2rS5BdMhoi4sUjCKi5ELiqtyww/X
gY5iFqv6D4Pw9QvOUcdRVSbPWo1DwMmH75It6pk/rARIFHEjWwIDAQABo4GOMIGL
MB8GA1UdIwQYMBaAFHletne34lKDQ+3HUYhMY4UsAENYMAUdEwQFMAMBAf8w
LgYDVR0fBCcwJTAjoCGgH4YdaHR0cDovLzE5Mi4xNjguOS4xNDkvY3JsMS5jcmww
CwYDVR0PBAQDAgH+MB0GA1UdDgQWBBR5XrZ3t+JSg0Ptx1GITGOFLABDWDANBgkq
hkiG9w0BAQUFAAOBgQDGrAm2U/of1LbOnG2bnnVaBXiVJF8LKPaV23XQ96HU
8xfgSZMJS6U00WHAI7zp0q208RSUft9wDq9ee///VOhzR6Tebg9QfyPSohkBrhXQ
envQog555S+C3eJAAVeNCTeMS3N/M5hzBRJAoffn3qoYuOi+284A==
-----END CERTIFICATE-----

 ```
#### 差不多就是加密的字符串
 ```
 var options = {
                    hostname: 'kyfw.12306.cn',
                    path: querypath,
                    ca: [ca] //就是它
 ```
#### []里面的ca就是证书(对象)
#### 使用的时候
 ```
 var ca = fs.readFileSync('/Users/Someone/Documents/Projects/12306/srca.pem');
 ```
#### 不对...还有两个小坑，
#### 第一，12306证书好像是cer格式的...这里用的是pem格式...
#### 好吧，Google一下。。。
#### 第二，证书路径建议写绝对路径，要不有可能会加载不到
 
#### (2)请求字符串
#### 上面看到，请求返回的URL为
```
https://kyfw.12306.cn/otn/leftTicket/queryA?leftTicketDTO.train_date=2017-02-07&leftTicketDTO.from_station=BJP&leftTicketDTO.to_station=SHH&purpose_codes=ADULT
```
#### 这里以2月7号北京到上海的车票为栗子
#### 其中BJP和SHH分别是++车站电报码++，所以如果想通过命令行输入始发站和终点站来查询，就要先查询中文车站名字对应的电报码，然后构造请求字符串，Google一下，还真有这个
#### 不过可惜是表格，不过没关系，再Google，excel转json
#### 这里说明一下，企业有时会用表格记录数据(一般是项目规划人员或者不管程序这一块的人)，然后再进行json转化到实际程序中去,而excel里面就有这个功能，加载项，转化为json，搞定。
#### 如果不是office2013，也可以用网上的excel转json在线工具，完成
#### 不过，问题又出现了，excel里面有的站缺电报码，所以排序，删除了这些没有电报码的车站（不知道为啥没有）
#### 还有，就是转化前修改一下表格数据，让json更方便偶们后续操作
```
...
    { "name": "枣阳", "code": "ZYN" },
    { "name": "沾益", "code": "ZYM" },
    { "name": "张掖", "code": "ZYJ" },
    { "name": "张巷", "code": "ZYG" },
...
```

### 4.处理返回的数据
![这里写图片描述](http://img.blog.csdn.net/20170114163743505?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvU0Z0ZWM=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
#### (1)分析json看着就脑袋疼，得好好分析一下数据
在data里面：
```
queryLeftNewDTO.start_train_date       //日期
queryLeftNewDTO.start_station_name     //始发站
queryLeftNewDTO.end_station_name       //终点站
queryLeftNewDTO.station_train_code     //车次代码
queryLeftNewDTO.start_time             //开车时间
queryLeftNewDTO.arrive_time            //到达时间
queryLeftNewDTO.yz_num                 //硬座
queryLeftNewDTO.yw_num                 //硬卧
queryLeftNewDTO.rw_num                 //软卧
queryLeftNewDTO.wz_num                 //无座

```
#### (2)使用数据
#### 因为一般来说一天会有不止一趟车，所以用数组，数组元素为对象

#### 像这样:
```
...
for (var i = 0; i < json.data.length; ++i) {
    start_date[i] = '日期:' + json.data[i].queryLeftNewDTO.start_train_date;
    start_station_name[i] = '始发站:' + json.data[i].queryLeftNewDTO.start_station_name;
...
```

### 5.发送通知邮件
### 之前我写过一篇博客，简述了怎样使用这一模块
#### http://blog.csdn.net/sftec/article/details/53053495

## 四.结语
### 声明：新手作品，希望各位能指正一些错误；另外，不喜勿喷  :)