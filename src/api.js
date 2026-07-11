import axios from 'axios';

const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true';
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '';
const publicUrl = process.env.PUBLIC_URL || '';

const demoPath = (path) => `${publicUrl}/demo-data/${path}`;

const getJson = (url, config = {}) => axios.get(url, config);
const demoRequests = new Map();

// React StrictMode mounts effects twice in development. Share in-flight and
// completed demo requests so that static JSON files are only fetched once.
const getDemoJson = (path) => {
    const url = demoPath(path);
    if (!demoRequests.has(url)) {
        const request = getJson(url).catch((error) => {
            demoRequests.delete(url);
            throw error;
        });
        demoRequests.set(url, request);
    }
    return demoRequests.get(url);
};

export const getMergedData = () => {
    if (isDemoMode) {
        return getDemoJson('nodes/index.json').then(async (res) => {
            const nodeNames = Array.isArray(res.data) ? res.data : [];
            const nodes = await Promise.all(
                nodeNames.map((nodeName) => getNodeData(nodeName).then((nodeRes) => [nodeName, nodeRes.data]))
            );
            return {data: Object.fromEntries(nodes)};
        });
    }

    return getJson(`${apiBaseUrl}/merged_data?timestamp=${new Date().getTime()}`, {
        mode: 'cors',
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
        },
    });
};

export const getNodeData = (name, timestamp = null) => {
    if (isDemoMode) {
        const encodedName = encodeURIComponent(name);
        const encodedTimestamp = timestamp ? encodeURIComponent(timestamp) : null;
        if (encodedTimestamp) {
            return getDemoJson(`logs/${encodedName}/${encodedTimestamp}.json`)
                .catch(() => getDemoJson(`nodes/${encodedName}.json`));
        }
        return getDemoJson(`nodes/${encodedName}.json`);
    }

    const url = timestamp
        ? `${apiBaseUrl}/log/?n=${name}&t=${timestamp}`
        : `${apiBaseUrl}/node/?n=${name}&_=${new Date().getTime()}`;

    return getJson(url, {
        mode: 'cors',
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
        },
    });
};

export const getHistoryLogs = (name) => {
    if (isDemoMode) {
        return getDemoJson(`history/${encodeURIComponent(name)}.json`);
    }

    return getJson(`${apiBaseUrl}/history/?n=${name}`);
};

export const getNodeStats = (name) => {
    if (isDemoMode) {
        return getDemoJson(`node-stats/${encodeURIComponent(name)}.json`);
    }

    return getJson(`/node_stats/?n=${name}&_=${new Date().getTime()}`, {
        mode: 'cors',
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
        },
    });
};
