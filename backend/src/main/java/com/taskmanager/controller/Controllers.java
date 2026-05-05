package com.taskmanager.controller;

import com.taskmanager.dto.Dtos.*;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.service.DashboardService;
import com.taskmanager.service.ProjectService;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

// ── Helper ───────────────────────────────────────────────────────────────────
class BaseController {
    protected final UserRepository userRepository;

    BaseController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    protected User currentUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

// ── Dashboard Controller ─────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<DashboardStats> getDashboard(@AuthenticationPrincipal UserDetails ud) {
        User user = userRepository.findByEmail(ud.getUsername()).orElseThrow();
        return ResponseEntity.ok(dashboardService.getStats(user));
    }
}

// ── User Controller ──────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal UserDetails ud) {
        User user = userRepository.findByEmail(ud.getUsername()).orElseThrow();
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(
            userRepository.findAll().stream().map(UserResponse::from).collect(Collectors.toList())
        );
    }
}

// ── Project Controller ───────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository;

    private User me(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow();
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAll(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(projectService.getMyProjects(me(ud)));
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody ProjectRequest req,
                                                   @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(projectService.createProject(req, me(ud)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> get(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(projectService.getProject(id, me(ud)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> update(@PathVariable Long id,
                                                   @RequestBody ProjectRequest req,
                                                   @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(projectService.updateProject(id, req, me(ud)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        projectService.deleteProject(id, me(ud));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ProjectResponse> addMember(@PathVariable Long id,
                                                      @Valid @RequestBody AddMemberRequest req,
                                                      @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(projectService.addMember(id, req, me(ud)));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<ProjectResponse> removeMember(@PathVariable Long id,
                                                         @PathVariable Long userId,
                                                         @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(projectService.removeMember(id, userId, me(ud)));
    }
}

// ── Task Controller ──────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
class TaskController {

    private final TaskService taskService;
    private final UserRepository userRepository;

    private User me(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow();
    }

    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<List<TaskResponse>> getByProject(@PathVariable Long projectId,
                                                            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectId, me(ud)));
    }

    @GetMapping("/tasks/my")
    public ResponseEntity<List<TaskResponse>> getMyTasks(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(taskService.getMyTasks(me(ud)));
    }

    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<TaskResponse> create(@PathVariable Long projectId,
                                                @Valid @RequestBody TaskRequest req,
                                                @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(taskService.createTask(projectId, req, me(ud)));
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<TaskResponse> update(@PathVariable Long id,
                                                @RequestBody TaskRequest req,
                                                @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(taskService.updateTask(id, req, me(ud)));
    }

    @PatchMapping("/tasks/{id}/status")
    public ResponseEntity<TaskResponse> updateStatus(@PathVariable Long id,
                                                      @RequestParam Task.Status status,
                                                      @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(taskService.updateTaskStatus(id, status, me(ud)));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        taskService.deleteTask(id, me(ud));
        return ResponseEntity.noContent().build();
    }
}
