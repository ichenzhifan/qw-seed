const Koa = require('koa')
const Router = require('koa-router')
const static = require('koa-static')
const bodyParser = require('koa-bodyparser');
const axios = require('axios');

const conf = require('./conf');
const app = new Koa()
app.use(bodyParser())
const router = new Router()
app.use(static(__dirname + '/'))

const serverToken = {
    access_token: '',
    expires_in: 0,
    timestamp: Date.now()
}

router.get('/getAccessToken', async ctx => {
    const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${conf.cropid}&corpsecret=${conf.corpsecret}`;

    const res = await axios.get(url);

    const {
        access_token,
        expires_in
    } = res.data;

    Object.assign(serverToken, {
        access_token,
        expires_in,
        timestamp: Date.now()
    });

    ctx.body = res.data;
});

/**
 * 发送信息
 */
router.post('/sendMessage', async ctx => {
    const {
        text
    } = ctx.request.body;
    const url = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${serverToken.access_token}`;
    console.log('url', url);

    const res = await axios.post(url, {
        touser: "@all",
        msgtype: "text",
        agentid: conf.agentid,
        text: {
            content: text
        },
        safe: 0,
        enable_duplicate_check: 0,
        duplicate_check_interval: 1800
    });
    ctx.body = res.data;
});

app.use(router.routes()); /*启动路由*/
app.use(router.allowedMethods());
app.listen(3000);