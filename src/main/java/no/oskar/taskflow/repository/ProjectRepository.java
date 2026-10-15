
package no.oskar.taskflow.repository;

import no.oskar.taskflow.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
}
