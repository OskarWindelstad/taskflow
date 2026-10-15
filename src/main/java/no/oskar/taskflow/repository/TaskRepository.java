
package no.oskar.taskflow.repository;

import no.oskar.taskflow.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
}
