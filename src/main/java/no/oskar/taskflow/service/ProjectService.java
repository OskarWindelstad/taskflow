
package no.oskar.taskflow.service;

import no.oskar.taskflow.AppUser;
import no.oskar.taskflow.Project;
import no.oskar.taskflow.repository.AppUserRepository;
import no.oskar.taskflow.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final AppUserRepository appUserRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            AppUserRepository appUserRepository) {
        this.projectRepository = projectRepository;
        this.appUserRepository = appUserRepository;
    }

    public List<Project> getAllProjects(String email) {
        AppUser user = getUserByEmail(email);
        return projectRepository.findAllByOwnerId(user.getId());
    }

    public Project createProject(Project project, String email) {
        if (project.getName() == null || project.getName().isBlank()) {
            throw new IllegalArgumentException("Project name is required");
        }

        AppUser user = getUserByEmail(email);

        project.setName(project.getName().trim());
        project.setOwner(user);

        return projectRepository.save(project);
    }

    private AppUser getUserByEmail(String email) {
        return appUserRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));
    }
}
