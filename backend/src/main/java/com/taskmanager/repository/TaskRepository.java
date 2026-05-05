package com.taskmanager.repository;

import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectId(Long projectId);

    List<Task> findByAssignedTo(User user);

    @Query("SELECT t FROM Task t WHERE t.assignedTo = :user AND t.status != 'DONE'")
    List<Task> findActiveTasksByUser(@Param("user") User user);

    @Query("SELECT t FROM Task t WHERE t.dueDate < :today AND t.status != 'DONE'")
    List<Task> findOverdueTasks(@Param("today") LocalDate today);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND t.dueDate < :today AND t.status != 'DONE'")
    List<Task> findOverdueTasksByProject(@Param("projectId") Long projectId, @Param("today") LocalDate today);

    @Query("SELECT t FROM Task t WHERE t.assignedTo = :user AND t.dueDate < :today AND t.status != 'DONE'")
    List<Task> findOverdueTasksByUser(@Param("user") User user, @Param("today") LocalDate today);

    long countByProjectIdAndStatus(Long projectId, Task.Status status);
}
