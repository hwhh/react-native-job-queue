import { Job } from './models/Job';

export interface WorkerOptions {
    onStart?: (job: Job) => void;
    onSuccess?: (job: Job) => void;
    onFailure?: (job: Job, error: Error) => void;
    onCompletion?: (job: Job) => void;
    concurrency?: number;
}
export class Worker {
    public readonly name: string;
    public readonly concurrency: number;

    private executionCount: number;
    private runner: (payload: any) => Promise<any>;

    private onStart: (job: Job) => void;
    private onSuccess: (job: Job) => void;
    private onFailure: (job: Job, error: Error) => void;
    private onCompletion: (job: Job) => void;

    constructor(name: string, runner: (payload: any) => Promise<any>, options: WorkerOptions = {}) {
        const {
            onStart = (job: Job) => {},
            onSuccess = (job: Job) => {},
            onFailure = (job: Job, error: Error) => {},
            onCompletion = (job: Job) => {},
            concurrency = 5
        } = options;

        this.name = name;
        this.concurrency = concurrency;

        this.executionCount = 0;
        this.runner = runner;

        this.onStart = onStart;
        this.onSuccess = onSuccess;
        this.onFailure = onFailure;
        this.onCompletion = onCompletion;
    }

    get isBusy() {
        return this.executionCount === this.concurrency;
    }
    get availableExecuters() {
        return this.concurrency - this.executionCount;
    }
    async execute(job: Job) {
        const { timeout } = job;

        this.executionCount++;
        try {
            this.onStart(job);
            if (timeout > 0) {
                await this.executeWithTimeout(job, timeout);
            } else {
                await this.runner(JSON.parse(job.payload));
            }
            this.onSuccess(job);
        } catch (error) {
            this.onFailure(job, error);
            throw error;
        } finally {
            this.executionCount--;
            this.onCompletion(job);
        }
    }
    async executeWithTimeout(job: Job, timeout: number) {
        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error(`Job ${job.id} timed out`));
            }, timeout);
        });
        await Promise.race([timeoutPromise, this.runner(JSON.parse(job.payload))]);
    }
}
