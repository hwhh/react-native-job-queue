package com.github.simonerm;

import androidx.room.Dao;
import androidx.room.Delete;
import androidx.room.Insert;
import androidx.room.Query;
import androidx.room.Update;

import java.util.List;

@Dao
public interface JobDao {
    @Query("SELECT * FROM job")
    List<Job> getAll();

    @Query("SELECT * FROM job WHERE active == 0 AND failed == '' ORDER BY priority,datetime(created),datetime(executionTime) desc LIMIT 1")
    Job getNextJob();

    @Query("SELECT * FROM job WHERE active == 0 AND failed == '' ORDER BY priority,datetime(created),datetime(executionTime) desc")
    List<Job> getJobs();

    @Query("SELECT * FROM job WHERE active == 1 AND failed == '' ORDER BY priority,datetime(created),datetime(executionTime) desc")
    List<Job> getActiveJobs();

    @Query("SELECT * FROM job WHERE active == 0 AND failed == '' AND worker_name == :workerName ORDER BY priority,datetime(created),datetime(executionTime) desc LIMIT :limit")
    List<Job> getJobsForWorker(String workerName, int limit);

    @Query("SELECT * FROM job where id LIKE  :id")
    Job findById(String id);

    @Query("SELECT COUNT(*) from job")
    int countJobs();

    @Update
    void update(Job job);

    @Update
    void updateJobExecutionTime(Job job);

    @Insert
    void insert(Job job);

    @Delete
    void delete(Job job);

    @Query("DELETE FROM job WHERE worker_name == :workerName")
    void deleteJobsByWorkerName(String workerName);
}
