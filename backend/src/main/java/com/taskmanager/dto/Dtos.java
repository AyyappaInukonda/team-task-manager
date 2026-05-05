package com.taskmanager.dto;

import com.taskmanager.entity.Project;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public class Dtos {

    // ─── Auth ───────────────────────────────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SignupRequest {
        @NotBlank private String name;
        @Email @NotBlank private String email;
        @NotBlank @Size(min = 6) private String password;
        private User.Role role;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LoginRequest {
        @Email @NotBlank private String email;
        @NotBlank private String password;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AuthResponse {
        private String token;
        private UserResponse user;
    }

    // ─── User ───────────────────────────────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UserResponse {
        private Long id;
        private String name;
        private String email;
        private User.Role role;
        private LocalDateTime createdAt;

        public static UserResponse from(User u) {
            return UserResponse.builder()
                .id(u.getId()).name(u.getName()).email(u.getEmail())
                .role(u.getRole()).createdAt(u.getCreatedAt()).build();
        }
    }

    // ─── Project ─────────────────────────────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ProjectRequest {
        @NotBlank private String name;
        private String description;
        private Project.Status status;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ProjectResponse {
        private Long id;
        private String name;
        private String description;
        private Project.Status status;
        private UserResponse owner;
        private Set<UserResponse> members;
        private int totalTasks;
        private int doneTasks;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AddMemberRequest {
        @Email @NotBlank private String email;
    }

    // ─── Task ────────────────────────────────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TaskRequest {
        @NotBlank private String title;
        private String description;
        private Task.Status status;
        private Task.Priority priority;
        private LocalDate dueDate;
        private Long assignedToId;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TaskResponse {
        private Long id;
        private String title;
        private String description;
        private Task.Status status;
        private Task.Priority priority;
        private LocalDate dueDate;
        private boolean overdue;
        private Long projectId;
        private String projectName;
        private UserResponse assignedTo;
        private UserResponse createdBy;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    // ─── Dashboard ───────────────────────────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DashboardStats {
        private long totalProjects;
        private long totalTasks;
        private long tasksTodo;
        private long tasksInProgress;
        private long tasksReview;
        private long tasksDone;
        private long overdueTasks;
        private List<TaskResponse> recentTasks;
        private List<ProjectResponse> recentProjects;
    }
}
