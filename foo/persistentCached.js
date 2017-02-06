import path from 'path';
import PersistentCache from './PersistentCache';

let persistentCache = new PersistentCache(path.resolve(__dirname, 'persistentCacheFiles'));

export default (cacheId, fn) => {
    return persistentCache.cached(cacheId, fn);
};