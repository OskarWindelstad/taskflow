
package no.oskar.taskflow.service;

import no.oskar.taskflow.AppUser;
import no.oskar.taskflow.Project;
import no.oskar.taskflow.Task;
import no.oskar.taskflow.repository.AppUserRepository;
import no.oskar.taskflow.repository.ProjectRepository;
import no.oskar.taskflow.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final AppUserRepository appUserRepository;

    public TaskService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            AppUserRepository appUserRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.appUserRepository = appUserRepository;
    }

    @Transactional(readOnly = true)
    public List<Task> getAllTasks(String email) {
        AppUser user = getUserByEmail(email);
        return taskRepository.findAllByOwnerId(user.getId());
    }

    @Transactional
    public Task createTask(Task task, String email) {
        AppUser user = getUserByEmail(email);

        validateTitle(task.getTitle());
        task.setTitle(task.getTitle().trim());
        task.setOwner(user);

        if (task.getStatus() == null || task.getStatus().isBlank()) {
            task.setStatus("Todo");
        }

        if (task.getPriority() == null || task.getPriority().isBlank()) {
            task.setPriority("Medium");
        }

        task.setProject(resolveProject(task.getProject(), user));

        return taskRepository.save(task);
    }

    @Transactional
    public Task updateTask(Long id, Task updatedTask, String email) {
        AppUser user = getUserByEmail(email);

        Task task = taskRepository
                .findByIdAndOwnerId(id, user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Task not found"));

        validateTitle(updatedTask.getTitle());

        task.setTitle(updatedTask.getTitle().trim());

        if (updatedTask.getStatus() != null
                && !updatedTask.getStatus().isBlank()) {
            task.setStatus(updatedTask.getStatus());
        }

        if (updatedTask.getPriority() != null
                && !updatedTask.getPriority().isBlank()) {
            task.setPriority(updatedTask.getPriority());
        }

        task.setDueDate(updatedTask.getDueDate());
        task.setProject(resolveProject(updatedTask.getProject(), user));

        // Behold eksisterende eier. Ikke bruk eier sendt fra frontend.
        return taskRepository.save(task);
    }

    @Transactional
    public void deleteTask(Long id, String email) {
        AppUser user = getUserByEmail(email);

        Task task = taskRepository
                .findByIdAndOwnerId(id, user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Task not found"));

        taskRepository.delete(task);
    }

    private Project resolveProject(Project requestedProject, AppUser user) {
        if (requestedProject == null || requestedProject.getId() == null) {
            return null;
        }

        return projectRepository
                .findByIdAndOwnerId(
                        requestedProject.getId(),
                        user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Project not found"));
    }

    private void validateTitle(String title) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Task title is required");
        }
    }

    private AppUser getUserByEmail(String email) {
        return appUserRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));
    }
}
