package com.taskmanager.service;

import com.taskmanager.dto.Dtos.*;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final TaskService taskService;
    private final ProjectService projectService;

    public DashboardStats getStats(User currentUser) {
        var projects = currentUser.getRole() == User.Role.ADMIN
            ? projectRepository.findAll()
            : projectRepository.findAllByMemberOrOwner(currentUser);

        var tasks = currentUser.getRole() == User.Role.ADMIN
            ? taskRepository.findAll()
            : taskRepository.findByAssignedTo(currentUser);

        var overdue = currentUser.getRole() == User.Role.ADMIN
            ? taskRepository.findOverdueTasks(LocalDate.now())
            : taskRepository.findOverdueTasksByUser(currentUser, LocalDate.now());

        List<TaskResponse> recentTasks = tasks.stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .limit(5)
            .map(taskService::toResponse)
            .collect(Collectors.toList());

        List<ProjectResponse> recentProjects = projects.stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .limit(5)
            .map(p -> projectService.toResponse(p, currentUser))
            .collect(Collectors.toList());

        return DashboardStats.builder()
            .totalProjects(projects.size())
            .totalTasks(tasks.size())
            .tasksTodo(tasks.stream().filter(t -> t.getStatus() == Task.Status.TODO).count())
            .tasksInProgress(tasks.stream().filter(t -> t.getStatus() == Task.Status.IN_PROGRESS).count())
            .tasksReview(tasks.stream().filter(t -> t.getStatus() == Task.Status.REVIEW).count())
            .tasksDone(tasks.stream().filter(t -> t.getStatus() == Task.Status.DONE).count())
            .overdueTasks(overdue.size())
            .recentTasks(recentTasks)
            .recentProjects(recentProjects)
            .build();
    }
}
