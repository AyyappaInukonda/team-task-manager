package com.taskmanager.service;

import com.taskmanager.dto.Dtos.*;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public List<TaskResponse> getTasksByProject(Long projectId, User currentUser) {
        return taskRepository.findByProjectId(projectId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<TaskResponse> getMyTasks(User currentUser) {
        return taskRepository.findByAssignedTo(currentUser)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TaskResponse createTask(Long projectId, TaskRequest req, User currentUser) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found"));

        User assignedTo = null;
        if (req.getAssignedToId() != null) {
            assignedTo = userRepository.findById(req.getAssignedToId())
                .orElseThrow(() -> new RuntimeException("Assigned user not found"));
        }

        Task task = Task.builder()
            .title(req.getTitle())
            .description(req.getDescription())
            .status(req.getStatus() != null ? req.getStatus() : Task.Status.TODO)
            .priority(req.getPriority() != null ? req.getPriority() : Task.Priority.MEDIUM)
            .dueDate(req.getDueDate())
            .project(project)
            .assignedTo(assignedTo)
            .createdBy(currentUser)
            .build();

        return toResponse(taskRepository.save(task));
    }

    public TaskResponse updateTask(Long taskId, TaskRequest req, User currentUser) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));

        if (req.getTitle() != null) task.setTitle(req.getTitle());
        if (req.getDescription() != null) task.setDescription(req.getDescription());
        if (req.getStatus() != null) task.setStatus(req.getStatus());
        if (req.getPriority() != null) task.setPriority(req.getPriority());
        if (req.getDueDate() != null) task.setDueDate(req.getDueDate());

        if (req.getAssignedToId() != null) {
            User assignedTo = userRepository.findById(req.getAssignedToId())
                .orElseThrow(() -> new RuntimeException("Assigned user not found"));
            task.setAssignedTo(assignedTo);
        }

        return toResponse(taskRepository.save(task));
    }

    public TaskResponse updateTaskStatus(Long taskId, Task.Status status, User currentUser) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(status);
        return toResponse(taskRepository.save(task));
    }

    public void deleteTask(Long taskId, User currentUser) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));
        if (currentUser.getRole() != User.Role.ADMIN &&
            !task.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Not authorized to delete this task");
        }
        taskRepository.delete(task);
    }

    public TaskResponse toResponse(Task t) {
        boolean overdue = t.getDueDate() != null
            && t.getDueDate().isBefore(LocalDate.now())
            && t.getStatus() != Task.Status.DONE;
        return TaskResponse.builder()
            .id(t.getId())
            .title(t.getTitle())
            .description(t.getDescription())
            .status(t.getStatus())
            .priority(t.getPriority())
            .dueDate(t.getDueDate())
            .overdue(overdue)
            .projectId(t.getProject().getId())
            .projectName(t.getProject().getName())
            .assignedTo(t.getAssignedTo() != null ? UserResponse.from(t.getAssignedTo()) : null)
            .createdBy(UserResponse.from(t.getCreatedBy()))
            .createdAt(t.getCreatedAt())
            .updatedAt(t.getUpdatedAt())
            .build();
    }
}
