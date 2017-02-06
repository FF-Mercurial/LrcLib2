import * as _ from './util';
import request from 'request';

export function search(keyword, limit, cb) {
    request({
        url: 'http://baidu.com/s',
        qs: {
            tn: 'json',
            rn: limit,
            wd: keyword,
        },
        json: true,
    }, (err, res, d) => {
        if (err) {
            cb({
                type: 'HttpError',
                message: '网络错误',
                originErr: err,
            });
            return;
        }

        let items = _.deepGet(d, 'feed.entry');

        if (!(items instanceof Array)) {
            cb({
                type: 'BaiduApiError',
                message: '百度API响应格式错误',
                body: d,
            });
            return;
        }

        items = items.slice(0, limit);

        cb(null, items);
    });
};

export function searchUrls(keyword, limit, cb) {
    search(keyword, limit, (err, items) => {
        if (err) return cb(err);

        cb(null, items.map(item => item.url));
    });
};

// test
import persistentCached from './persistentCached';

let cachedSearchUrls = persistentCached('searchUrls', searchUrls);

cachedSearchUrls('joint 歌词', 10, (err, urls) => {
    if (err) return console.log(err);

    console.log(urls);
});