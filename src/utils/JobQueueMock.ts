import { RawJob } from '../models/Job';
import { JobStore } from '../models/JobStore';

export class JobStoreMock implements JobStore {
    jobs: RawJob[] = [];
    constructor() {}
    addJob(job: RawJob): Promise<void> {
        this.jobs.push(job);
        return new Promise((resolve) => resolve());
    }
    getJobs(): Promise<RawJob[]> {
        return new Promise((resolve) => resolve(this.jobs));
    }

    getActiveJobs(): Promise<RawJob[]> {
        return new Promise((resolve) => resolve(this.jobs.filter((job) => job.active)));
    }

    getNextJob(): Promise<RawJob> {
        // "SELECT * FROM job WHERE active == 0 AND failed == '' ORDER BY priority,datetime(created) LIMIT 1"
        const filtered = this.jobs.filter((job) => job.active === 0 && job.failed === '');
        const sortedByPrior = filtered.sort((a, b) => {
            if (a.priority > b.priority) {
                return -1;
            }
            return 1;
        });
        const sortedByDate = sortedByPrior.sort((a, b) => {
            if (new Date(a.created).getTime() > new Date(b.created).getTime()) {
                return -1;
            }
            return 1;
        });
        const sortByExecutionTime = sortedByDate.sort((a, b) => {
            if (new Date(a.executionTime).getTime() > new Date(b.executionTime).getTime()) {
                return -1;
            }
            return 1;
        });
        return new Promise((resolve) => resolve(sortByExecutionTime[0] || {}));
    }
    getJobsForWorker(name: string, count: number): Promise<RawJob[]> {
        const filtered = this.jobs.filter((job) => job.workerName === name);
        return new Promise((resolve) => resolve(filtered.slice(0, count)));
    }
    updateJob(rawJob: RawJob): void {
        this.jobs = this.jobs.map((job) => {
            if (rawJob.id === job.id) {
                return rawJob;
            }
            return job;
        });
    }
    removeJob(rawJob: RawJob): void {
        this.jobs = this.jobs.filter((job) => job.id !== rawJob.id);
    }
    removeJobsByWorkerName(workerName: string): void {
        this.jobs = this.jobs.filter((job) => job.workerName !== workerName);
    }
    deleteAllJobs(): Promise<void> {
        this.jobs = [];
        return new Promise((resolve) => resolve());
    }
}
