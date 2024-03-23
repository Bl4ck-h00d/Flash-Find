import WebWorker from './WebWorker';
import worker from './worker.js'

class ThunderSearch {
    constructor(dataSource, workerScript = worker) {
        if (!ThunderSearch.instance) {
            this.workerPool = [];
            this.dataChunks = [];
            this.threadSyncFlag = 0;
            this.searchResult = [];
            this.workerScript = workerScript;
            this.dataSource = dataSource;

            ThunderSearch.instance = this;
        }

        return ThunderSearch.instance;
    }

    init(callback) {
        this.workerPool = [];
        for (let i = 0; i < navigator.hardwareConcurrency; i++) {
            const workerThread = new WebWorker(this.workerScript);
            this.workerPool.push(workerThread);
            workerThread.addEventListener('message', (event) => this.handleMessage(event, callback));
        }
        this.dataChunks = this.chunkifyRecordsPerCore(this.dataSource);
    }

    handleMessage(event, callback) {
        const searchedRecords = event.data;
        this.threadSyncFlag += 1;
        if (this.threadSyncFlag === 1) {
            this.searchResult = [...searchedRecords];
        } else {
            this.searchResult = [...this.searchResult, ...searchedRecords];
        }
        if (this.threadSyncFlag === navigator.hardwareConcurrency) {
            callback(this.searchResult);
        }
    }

    chunkifyRecordsPerCore(data) {
        const recordsPerCore = [];
        let prevIdx = 0;
        for (let core = 0; core < this.workerPool.length; core++) {
            recordsPerCore.push(data.slice(prevIdx, prevIdx + Math.ceil(data.length / this.workerPool.length)));
            prevIdx += Math.ceil(data.length / this.workerPool.length);
        }
        return recordsPerCore;
    }

    search(query) {
        this.threadSyncFlag = 0;
        this.searchResult = [];

        const taskQueue = [];

        const isWorkerAvailable = () => {
            return this.workerPool.some(worker => !worker.isBusy);
        };

        const executePendingTasks = () => {
            while (taskQueue.length > 0 && isWorkerAvailable()) {
                const task = taskQueue.shift();
                this.executeTask(task);
            }
        };

        const executeTask = ({ idx, workerThread }) => {
            // const start = performance.now();
            workerThread.isBusy = true;
            workerThread.postMessage({
                record: this.dataChunks[idx],
                searchText: `${query}`,
            });

            workerThread.addEventListener('message', () => {
                // const end = performance.now();
                // console.log(`worker ${idx}:`, end - start)
                workerThread.isBusy = false;
                executePendingTasks();
            });
        };

        for (const [idx, workerThread] of this.workerPool.entries()) {
            if (isWorkerAvailable()) {
                executeTask({ idx, workerThread });
            } else {
                taskQueue.push({ idx, workerThread });
            }
        }
    }
}

export default ThunderSearch;