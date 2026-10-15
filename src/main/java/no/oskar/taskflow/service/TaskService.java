
package no.oskar.taskflow.service;

import no.oskar.taskflow.Project;
import no.oskar.taskflow.Task;
import no.oskar.taskflow.repository.ProjectRepository;
import no.oskar.taskflow.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    public TaskService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @Transactional
    public Task createTask(Task task) {
        task.setStatus(
                task.getStatus() == null || task.getStatus().isBlank()
                        ? "Todo" : task.getStatus()
        );

        task.setPriority(
                task.getPriority() == null || task.getPriority().isBlank()
                        ? "Medium" : task.getPriority()
        );

        if (task.getProject() != null && task.getProject().getId() != null) {
            Project project = projectRepository.findById(
                    task.getProject().getId()
            ).orElseThrow(() ->
                    new IllegalArgumentException("Project not found")
            );

            task.setProject(project);
        } else {
            task.setProject(null);
        }

        return taskRepository.save(task);
    }

    @Transactional
    public Task updateTask(Long id, Task updatedTask) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Task not found: " + id)
                );

        task.setTitle(updatedTask.getTitle());
        task.setPriority(updatedTask.getPriority());
        task.setStatus(updatedTask.getStatus());

        if (updatedTask.getProject() != null
                && updatedTask.getProject().getId() != null) {
            Project project = projectRepository.findById(
                    updatedTask.getProject().getId()
            ).orElseThrow(() ->
                    new IllegalArgumentException("Project not found")
            );

            task.setProject(project);
        } else {
            task.setProject(null);
        }

        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new IllegalArgumentException("Task not found: " + id);
        }

        taskRepository.deleteById(id);
    }
}
