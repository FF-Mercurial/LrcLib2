export function deepGet(obj, keysStr) {
    return deepGetByKeys(obj, keysStr.split('.'));
};

export function deepGetByKeys(obj, keys) {
    let firstKey = keys[0];

    if (!firstKey) return obj;
    if (typeof obj !== 'object' || obj === null) return undefined;

    return deepGetByKeys(obj[firstKey], keys.slice(1));
};