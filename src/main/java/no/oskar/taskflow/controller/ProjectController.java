
package no.oskar.taskflow.controller;

import no.oskar.taskflow.Project;
import no.oskar.taskflow.service.ProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<Project> getAllProjects(
            Authentication authentication) {
        return projectService.getAllProjects(
                authentication.getName()
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Project createProject(
            @RequestBody Project project,
            Authentication authentication) {
        return projectService.createProject(
                project,
                authentication.getName()
        );
    }
}
