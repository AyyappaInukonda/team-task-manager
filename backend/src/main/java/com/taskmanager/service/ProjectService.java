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

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public List<ProjectResponse> getMyProjects(User currentUser) {
        List<Project> projects = currentUser.getRole() == User.Role.ADMIN
            ? projectRepository.findAll()
            : projectRepository.findAllByMemberOrOwner(currentUser);
        return projects.stream().map(p -> toResponse(p, currentUser)).collect(Collectors.toList());
    }

    public ProjectResponse createProject(ProjectRequest req, User owner) {
        Project project = Project.builder()
            .name(req.getName())
            .description(req.getDescription())
            .status(req.getStatus() != null ? req.getStatus() : Project.Status.ACTIVE)
            .owner(owner)
            .build();
        project.getMembers().add(owner);
        return toResponse(projectRepository.save(project), owner);
    }

    public ProjectResponse getProject(Long id, User currentUser) {
        Project project = findAndAuthorize(id, currentUser);
        return toResponse(project, currentUser);
    }

    public ProjectResponse updateProject(Long id, ProjectRequest req, User currentUser) {
        Project project = findAndAuthorize(id, currentUser);
        if (!project.getOwner().getId().equals(currentUser.getId()) && currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only project owner or admin can update project");
        }
        if (req.getName() != null) project.setName(req.getName());
        if (req.getDescription() != null) project.setDescription(req.getDescription());
        if (req.getStatus() != null) project.setStatus(req.getStatus());
        return toResponse(projectRepository.save(project), currentUser);
    }

    public void deleteProject(Long id, User currentUser) {
        Project project = findAndAuthorize(id, currentUser);
        if (!project.getOwner().getId().equals(currentUser.getId()) && currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only project owner or admin can delete project");
        }
        projectRepository.delete(project);
    }

    public ProjectResponse addMember(Long projectId, AddMemberRequest req, User currentUser) {
        Project project = findAndAuthorize(projectId, currentUser);
        if (!project.getOwner().getId().equals(currentUser.getId()) && currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only project owner or admin can add members");
        }
        User member = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found: " + req.getEmail()));
        project.getMembers().add(member);
        return toResponse(projectRepository.save(project), currentUser);
    }

    public ProjectResponse removeMember(Long projectId, Long userId, User currentUser) {
        Project project = findAndAuthorize(projectId, currentUser);
        if (!project.getOwner().getId().equals(currentUser.getId()) && currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only project owner or admin can remove members");
        }
        User member = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        project.getMembers().remove(member);
        return toResponse(projectRepository.save(project), currentUser);
    }

    private Project findAndAuthorize(Long id, User currentUser) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Project not found"));
        if (currentUser.getRole() == User.Role.ADMIN) return project;
        boolean isMember = project.getMembers().stream()
            .anyMatch(m -> m.getId().equals(currentUser.getId()));
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        if (!isMember && !isOwner) throw new RuntimeException("Access denied");
        return project;
    }

    public ProjectResponse toResponse(Project p, User currentUser) {
        long total = taskRepository.countByProjectIdAndStatus(p.getId(), null) +
            taskRepository.countByProjectIdAndStatus(p.getId(), Task.Status.TODO) +
            taskRepository.countByProjectIdAndStatus(p.getId(), Task.Status.IN_PROGRESS) +
            taskRepository.countByProjectIdAndStatus(p.getId(), Task.Status.REVIEW) +
            taskRepository.countByProjectIdAndStatus(p.getId(), Task.Status.DONE);

        // simpler: count all tasks
        long allTasks = p.getTasks() != null ? p.getTasks().size() : 0;
        long doneTasks = p.getTasks() != null
            ? p.getTasks().stream().filter(t -> t.getStatus() == Task.Status.DONE).count()
            : 0;

        return ProjectResponse.builder()
            .id(p.getId())
            .name(p.getName())
            .description(p.getDescription())
            .status(p.getStatus())
            .owner(UserResponse.from(p.getOwner()))
            .members(p.getMembers().stream().map(UserResponse::from).collect(Collectors.toSet()))
            .totalTasks((int) allTasks)
            .doneTasks((int) doneTasks)
            .createdAt(p.getCreatedAt())
            .updatedAt(p.getUpdatedAt())
            .build();
    }
}
