import md5 from 'md5';
import fs from 'fs';
import path from 'path';

export default class {
    constructor(cachePath) {
        this.cachePath = cachePath;
    }

    cached(cacheId, fn) {
        let cachePath = this.cachePath;
        
        return function () {
            let args = [].slice.call(arguments);

            if (args.length < 1) throw new Error('没有回调函数');

            let cb = args[args.length - 1];

            if (typeof cb !== 'function') throw new Error('最后一个参数必须是回调函数');

            let inputs = args.slice(0, args.length - 1);
            let stringifiedInputs;

            try {
                stringifiedInputs = JSON.stringify(inputs);
            } catch (e) {
                throw new Error('输入参数必须可序列化');
            }

            let cacheKey = md5(`${cacheId}_${stringifiedInputs}`);
            let cacheFile = path.resolve(cachePath, cacheKey);

            if (fs.existsSync(cacheFile)) {
                let stringifiedOutputs = fs.readFileSync(cacheFile).toString();
                let outputs;

                try {
                    outputs = JSON.parse(stringifiedOutputs);
                    console.log('读缓存');
                } catch (e) {
                    throw new Error('缓存损坏');
                }

                return cb.apply(this, [null].concat(outputs));
            }

            fn.apply(this, inputs.concat([function () {
                let args = [].slice.call(arguments);
                let err = args[0];
                let outputs = args.slice(1);

                if (err) return cb.apply(this, args);

                let stringifiedOutputs;

                try {
                    stringifiedOutputs = JSON.stringify(outputs)
                } catch (e) {
                    cb({
                        type: 'OutputNotStringified',
                        message: '输出必须可序列化',
                        outputs,
                    });
                    return;
                }

                fs.writeFileSync(cacheFile, stringifiedOutputs);
                console.log('写缓存');

                cb.apply(this, [null].concat(outputs));
            }]));
        };
    }
}