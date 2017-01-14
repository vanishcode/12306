const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('格式：\n日期：’2017-01-11‘，始发站：’北京‘，终点站：‘天津’');

rl.question('日期:\n', (date) => {
    rl.question('始发站:\n', (start) => {
        rl.question('终点站:\n', (end) => {
            console.log("任务已建立...");
            var traindata = require('path/to/traincode');
            // 写绝对路径吧...
            for (var k = 0; k < traindata.traindata.length; k++) {

                if (start == traindata.traindata[k].name) {
                    startcode = traindata.traindata[k].code;
                    break;
                }
            }
            for (var j = 0; j < traindata.traindata.length; j++) {
                if (end == traindata.traindata[j].name) {
                    var endcode = traindata.traindata[j].code;
                    break;
                }
            }
            //main
            var go = function() {
                var https = require('https');
                var fs = require('fs');
                var ca = fs.readFileSync('path/to/srca.pem');

                var start_date = new Array();
                var start_station_name = new Array();
                var end_station_name = new Array();
                var station_train_code = new Array();
                var start_time = new Array();
                var arrive_time = new Array();
                var yz_num = new Array();
                var yw_num = new Array();
                var rw_num = new Array();
                var wz_num = new Array();
                var ticket = new Array();

                var querypath = '/otn/leftTicket/queryA?leftTicketDTO.train_date=' + date + '&leftTicketDTO.from_station=' + startcode + '&leftTicketDTO.to_station=' + endcode + '&purpose_codes=ADULT';
                var options = {
                    hostname: 'kyfw.12306.cn',
                    path: querypath,
                    ca: [ca]
                };
                var req = https.get(options, function(res) {
                    var json = '';
                    res.on('data', function(d) {
                        json += d;
                    })
                    res.on('end', function() {

                        json = JSON.parse(json);

                        console.log("\n");
                        for (var i = 0; i < json.data.length; ++i) {
                            // console.log(json.data[i].queryLeftNewDTO);
                            start_date[i] = '日期:' + json.data[i].queryLeftNewDTO.start_train_date;
                            start_station_name[i] = '始发站:' + json.data[i].queryLeftNewDTO.start_station_name;
                            end_station_name[i] = '终点站:' + json.data[i].queryLeftNewDTO.end_station_name;
                            station_train_code[i] = '车次代码:' + json.data[i].queryLeftNewDTO.station_train_code;
                            start_time[i] = '出发时间:' + json.data[i].queryLeftNewDTO.start_time;
                            arrive_time[i] = '到达时间:' + json.data[i].queryLeftNewDTO.arrive_time;
                            // console.log((json.data[i].queryLeftNewDTO.day_difference)?'当日达':'次日达');
                            yz_num[i] = '硬座:' + json.data[i].queryLeftNewDTO.yz_num;
                            yw_num[i] = '硬卧:' + json.data[i].queryLeftNewDTO.yw_num;
                            rw_num[i] = '软卧:' + json.data[i].queryLeftNewDTO.rw_num;
                            wz_num[i] = '无座:' + json.data[i].queryLeftNewDTO.wz_num;

                            ticket[i] = '</br>' + '</br>' + start_date[i] + '</br>' + start_station_name[i] + '</br>' + end_station_name[i] + '</br>' + station_train_code[i] + '</br>' + start_time[i] + '</br>' + arrive_time[i] + '</br>' + yz_num[i] + '</br>' + yw_num[i] + '</br>' + rw_num[i] + '</br>' + wz_num[i];
                        }

                        // 字符串拼接
                        // console.log(ticket);

                        var nodemailer = require('nodemailer');

                        var transporter = nodemailer.createTransport({
                            host: "smtp.qq.com", // 主机
                            secure: true, // 使用 SSL
                            port: 465, // SMTP 端口
                            auth: {
                                user: " ", // 账号
                                pass: " " // 密码
                            }
                        });

                        var mailOptions = {
                            from: ' ', // sender address
                            to: ' ', // list of receivers
                            subject: '查询结果', // Subject line
                            text: '', // plaintext body
                            html: '<b>车票查询结果</b></br>' + ticket
                        };

                        transporter.sendMail(mailOptions, function(error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Message sent: ' + info.response);
                            }
                        });
                    });
                });
                req.on('error', function(err) {
                    console.error(err.code);
                });
            }

            setInterval(go, 3000); // 自己设置
        });
    });

});
