




// Helper to cache data with a timestamp
function cacheData(key, data) {
    console.log('cacheData: Caching data for key:', key);
    return new Promise((resolve, reject) => {
        const cachedData = {
            data: data,
            timestamp: new Date().getTime()
        };
        chrome.storage.local.set({
            [key]: cachedData
        }, function () {
            console.log(`Data cached for key: ${key}`);
            resolve();
        });
    });
}




// Helper to get cached data , timeout in seconds
function getCachedData(key, cachetimeout) {
    console.log('getCachedData: Getting cached data for key:', key, ", with timeout:", cachetimeout);
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get([key], function (result) {
                if (result[key]) {
                    console.log(`Cached data for key: ${key}`, result[key].timestamp);
                    console.log((new Date().getTime() - result[key].timestamp));

                    // only accept data less than 3 hours old
                    //            if (result[key] && (new Date().getTime() - result[key].timestamp) < 3 * 3600 * 1000) {
                    // only accept data less than 10 seconds old
                    if (result[key] && (new Date().getTime() - result[key].timestamp) < cachetimeout * 1000) {
                        console.log(result[key].data);
                        resolve(result[key].data);
                    } else {
                        console.log("return null");
                        resolve(null);
                    }
                } else {
                    console.log("return null - cache miss");
                    resolve(null);
                }
            });
        } catch (e) {
            console.debug(e);
            reject(null);
        }
    });
}
