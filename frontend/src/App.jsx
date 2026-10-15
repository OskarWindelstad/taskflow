import "./App.css";
import { useEffect, useMemo, useState } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getProjects,
  createProject,
} from "./api";

function App() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [newTask, setNewTask] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [filterProjectId, setFilterProjectId] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [filterPriority, setFilterPriority] = useState("all");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editProject, setEditProject] = useState("");
  const [editPriority, setEditPriority] = useState("Medium");

  useEffect(() => {
    async function loadData() {
      try {
        const [taskData, projectData] = await Promise.all([
          getTasks(),
          getProjects(),
        ]);
        setTasks(taskData);
        setProjects(projectData);
      } catch (err) {
        console.error(err);
        setError(
            "Could not load tasks or projects. Check that the backend is running."
        );
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const completed = tasks.filter((task) => task.status === "Done").length;
  const inProgress = tasks.filter(
      (task) => task.status === "In progress"
  ).length;


  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDate || task.status === "Done") {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(`${task.dueDate}T00:00:00`);

    return !Number.isNaN(dueDate.getTime()) && dueDate < today;
  }).length;



  const filteredTasks = useMemo(() => {
    const priorityRank = { High: 0, Medium: 1, Low: 2 };
    const statusRank = { Todo: 0, "In progress": 1, Done: 2 };

    const matchingTasks = tasks.filter((task) => {
      const matchesProject =
          filterProjectId === "all" ||
          (filterProjectId === "none" && !task.project?.id) ||
          String(task.project?.id) === filterProjectId;

      const matchesPriority =
          filterPriority === "all" ||
          (task.priority || "Medium") === filterPriority;

      const matchesSearch =
          (task.title || "")
              .toLowerCase()
              .includes(searchQuery.trim().toLowerCase());

      return matchesProject && matchesPriority && matchesSearch;
    });

    return [...matchingTasks].sort((a, b) => {
      if (sortBy === "priority") {
        return (
            (priorityRank[a.priority || "Medium"] ?? 1) -
            (priorityRank[b.priority || "Medium"] ?? 1)
        );
      }

      if (sortBy === "status") {
        return (
            (statusRank[a.status || "Todo"] ?? 0) -
            (statusRank[b.status || "Todo"] ?? 0)
        );
      }

      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }

      return 0;
    });
  }, [
    tasks,
    filterProjectId,
    filterPriority,
    searchQuery,
    sortBy,
  ]);


  async function handleCreateProject(event) {
    event.preventDefault();
    if (!newProjectName.trim()) {
      setError("Project name is required.");
      return;
    }
    try {
      const created = await createProject({
        name: newProjectName.trim(),
        description: newProjectDescription.trim(),
      });
      setProjects((previous) => [...previous, created]);
      setNewProjectName("");
      setNewProjectDescription("");
      setSelectedProjectId(String(created.id));
      setError("");
    } catch (err) {
      console.error(err);
      setError("Could not create project.");
    }
  }

  async function addTask(event) {
    event.preventDefault();
    if (!newTask.trim()) {
      setError("Task title is required.");
      return;
    }
    try {

        const created = await createTask({
          title: newTask.trim(),
          project: selectedProjectId
              ? { id: Number(selectedProjectId) }
              : null,
          priority: "Medium",
          status: "Todo",
          dueDate: newTaskDueDate || null,
      });
      setTasks((previous) => [...previous, created]);
      setNewTask("");
      setNewTaskDueDate("");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Could not create task. Please try again.");
    }
  }

  async function changeStatus(task, status) {
    try {
      const updated = await updateTask(task.id, {
        title: task.title,
        project: task.project ? { id: task.project.id } : null,
        priority: task.priority || "Medium",
        status,
      });
      setTasks((previous) =>
          previous.map((item) => (item.id === updated.id ? updated : item))
      );
      setError("");
    } catch (err) {
      console.error(err);
      setError("Could not update task status.");
    }
  }

  function startEditing(task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditProject(task.project?.id ? String(task.project.id) : "");
    setEditPriority(task.priority || "Medium");
  }

  async function saveEdit(task) {
    if (!editTitle.trim()) {
      setError("Task title cannot be empty.");
      return;
    }
    try {
      const updated = await updateTask(task.id, {
        title: editTitle.trim(),
        project: editProject ? { id: Number(editProject) } : null,
        priority: editPriority,
        status: task.status || "Todo",
      });
      setTasks((previous) =>
          previous.map((item) => (item.id === updated.id ? updated : item))
      );
      setEditingId(null);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Could not save task changes.");
    }
  }

  async function removeTask(task) {
    const confirmed = window.confirm(
        `Are you sure you want to delete "${task.title}"?`
    );
    if (!confirmed) return;
    try {
      await deleteTask(task.id);
      setTasks((previous) => previous.filter((item) => item.id !== task.id));
      setError("");
    } catch (err) {
      console.error(err);
      setError("Could not delete task.");
    }
  }

  return (
      <div className="app">
        <aside className="sidebar">
          <h1 className="logo">
            Task<span>Flow</span>
          </h1>
          <p className="nav-label">WORKSPACE</p>
          <nav>
            <a className="nav-item active" href="#dashboard">▦ Dashboard</a>
            <a className="nav-item" href="#tasks">✓ My tasks</a>
            <a className="nav-item" href="#projects">▣ Projects</a>
          </nav>
          <div className="sidebar-bottom">
            <div className="avatar">OW</div>
            <div>
              <strong>My workspace</strong>
              <p>Personal account</p>
            </div>
          </div>
        </aside>

        <main className="main" id="dashboard">
          <header className="topbar">
            <span>Workspace / Dashboard</span>
            <span className="online"><i /> Workspace active</span>
          </header>

          <section className="welcome">
            <p className="eyebrow">OVERVIEW</p>
            <h2>Good afternoon 👋</h2>
            <p>Here&apos;s what&apos;s happening with your projects today.</p>
          </section>


          <section className="stats">
            <article className="stat-card">
              <p>Total tasks</p>
              <h3>{tasks.length}</h3>
              <span>Across your workspace</span>
            </article>

            <article className="stat-card">
              <p>In progress</p>
              <h3>{inProgress}</h3>
              <span>Currently being worked on</span>
            </article>

            <article className="stat-card">
              <p>Completed</p>
              <h3>{completed}</h3>
              <span>Tasks finished</span>
            </article>

            <article className="stat-card overdue-stat">
              <p>Overdue tasks</p>
              <h3>{overdueTasks}</h3>
              <span>Tasks past their due date</span>
            </article>
          </section>

          <section className="tasks-panel" id="projects">
            <div className="panel-heading">
              <div><h3>Projects</h3><p>Create and manage your workspace projects</p></div>
              <span className="task-count">{projects.length} projects</span>
            </div>
            <form className="project-form" onSubmit={handleCreateProject}>
              <input
                  value={newProjectName}
                  onChange={(event) => setNewProjectName(event.target.value)}
                  placeholder="Project name"
                  aria-label="Project name"
                  required
              />
              <input
                  value={newProjectDescription}
                  onChange={(event) => setNewProjectDescription(event.target.value)}
                  placeholder="Description (optional)"
                  aria-label="Project description"
              />
              <button type="submit">+ Add project</button>
            </form>

            <div className="projects-grid">
              {projects.map((project) => {
                const projectTasks = tasks.filter(
                    (task) => String(task.project?.id) === String(project.id)
                );
                const completedTasks = projectTasks.filter(
                    (task) => task.status === "Done"
                ).length;
                const progress = projectTasks.length
                    ? Math.round((completedTasks / projectTasks.length) * 100)
                    : 0;

                return (
                    <article className="project-card" key={project.id}>
                      <h4>{project.name}</h4>
                      <p>{project.description || "No description yet."}</p>
                      <div className="project-progress-heading">
                        <span>{completedTasks} of {projectTasks.length} tasks completed</span>
                        <strong>{progress}%</strong>
                      </div>
                      <div
                          className="project-progress-track"
                          role="progressbar"
                          aria-label={`${project.name} progress`}
                          aria-valuenow={progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                      >
                        <div className="project-progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                    </article>
                );
              })}
              {projects.length === 0 && !loading && (
                  <p className="empty">No projects yet. Create your first project above.</p>
              )}
            </div>
          </section>

          <section className="tasks-panel" id="tasks">
            <div className="panel-heading">
              <div><h3>My tasks</h3><p>Manage and track your work</p></div>
              <span className="task-count">{filteredTasks.length} of {tasks.length} tasks</span>
            </div>

            <form className="add-task" onSubmit={addTask}>
              <input
                  type="text"
                  value={newTask}
                  onChange={(event) => setNewTask(event.target.value)}
                  placeholder="What needs to be done?"
                  aria-label="New task title"
                  required
              />

              <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(event) => setNewTaskDueDate(event.target.value)}
                  aria-label="Task due date"
              />

              <select
                  value={selectedProjectId}
                  onChange={(event) => setSelectedProjectId(event.target.value)}
                  aria-label="Select project"
              >
                <option value="">No project</option>
                {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                ))}
              </select>

              <button type="submit" disabled={loading}>
                + Add task
              </button>
            </form>

            <div className="task-search">
              <label htmlFor="task-search-input">Search tasks</label>
              <input
                  id="task-search-input"
                  type="search"
                  placeholder="Search by task name..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
              />
              {searchQuery.trim() && (
                  <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                  >
                    Clear
                  </button>
              )}
            </div>

            {error && <p role="alert" className="error-message">{error}</p>}
            {loading && <p className="empty">Loading tasks...</p>}

            {!loading && (
                <>

                  <div className="task-toolbar">
                    <div className="project-filter">
                      <label htmlFor="project-filter">Filter by project</label>
                      <select
                          id="project-filter"
                          value={filterProjectId}
                          onChange={(event) => setFilterProjectId(event.target.value)}
                      >
                        <option value="all">All projects</option>
                        <option value="none">No project</option>
                        {projects.map((project) => (
                            <option key={project.id} value={String(project.id)}>
                              {project.name}
                            </option>
                        ))}
                      </select>
                    </div>

                    <div className="priority-filter">
                      <label htmlFor="filter-priority">Filter by priority</label>
                      <select
                          id="filter-priority"
                          value={filterPriority}
                          onChange={(event) => setFilterPriority(event.target.value)}
                      >
                        <option value="all">All priorities</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                    <div className="sort-control">
                      <label htmlFor="sort-tasks">Sort by</label>
                      <select
                          id="sort-tasks"
                          value={sortBy}
                          onChange={(event) => setSortBy(event.target.value)}
                      >
                        <option value="priority">Priority (High to Low)</option>
                        <option value="status">Status (Todo first)</option>
                        <option value="title">Task name (A–Z)</option>
                      </select>
                    </div>
                  </div>

                  <div className="task-list">
                    <div className="task-row task-header">
                      <span>Task</span><span>Project</span><span>Priority</span><span>Status</span>
                    </div>


                    {filteredTasks.map((task) => (
                        <div className="task-row" key={task.id}>
                          {editingId === task.id ? (
                              <div className="edit-fields">
                                <input
                                    value={editTitle}
                                    onChange={(event) => setEditTitle(event.target.value)}
                                    aria-label="Task title"
                                    required
                                />

                                <select
                                    value={editProject}
                                    onChange={(event) => setEditProject(event.target.value)}
                                    aria-label="Project"
                                >
                                  <option value="">No project</option>
                                  {projects.map((project) => (
                                      <option key={project.id} value={project.id}>
                                        {project.name}
                                      </option>
                                  ))}
                                </select>

                                <select
                                    value={editPriority}
                                    onChange={(event) => setEditPriority(event.target.value)}
                                    aria-label="Priority"
                                >
                                  <option value="Low">Low</option>
                                  <option value="Medium">Medium</option>
                                  <option value="High">High</option>
                                </select>

                                <button type="button" onClick={() => saveEdit(task)}>
                                  Save
                                </button>
                                <button type="button" onClick={() => setEditingId(null)}>
                                  Cancel
                                </button>
                              </div>
                          ) : (
                              <>
                                <div className="task-title">
          <span
              className={`task-dot ${task.status === "Done" ? "done" : ""}`}
          />

                                  <div className="task-title-details">
                                    <span className="task-title-text">{task.title}</span>

                                    {task.dueDate && (() => {
                                      const today = new Date();
                                      today.setHours(0, 0, 0, 0);

                                      const dueDate = new Date(`${task.dueDate}T00:00:00`);
                                      const isOverdue =
                                          !Number.isNaN(dueDate.getTime()) &&
                                          dueDate < today &&
                                          task.status !== "Done";

                                      return (
                                          <small className={`task-due-date ${isOverdue ? "overdue" : ""}`}>
                                            {isOverdue ? "Overdue · " : "Due: "}
                                            {task.dueDate}
                                          </small>
                                      );
                                    })()}
                                  </div>

                                </div>

                                <span className="project-name">
          {task.project?.name || "No project"}
        </span>

                                <span className={`priority ${(task.priority || "Medium").toLowerCase()}`}>
          {task.priority || "Medium"}
        </span>

                                <div className="task-actions">
                                  <select
                                      className={`status ${(task.status || "Todo").toLowerCase().replace(" ", "-")}`}
                                      value={task.status || "Todo"}
                                      onChange={(event) => changeStatus(task, event.target.value)}
                                      aria-label={`Status for ${task.title}`}
                                  >
                                    <option value="Todo">Todo</option>
                                    <option value="In progress">In progress</option>
                                    <option value="Done">Done</option>
                                  </select>

                                  <button type="button" onClick={() => startEditing(task)}>
                                    Edit
                                  </button>
                                  <button type="button" onClick={() => removeTask(task)}>
                                    Delete
                                  </button>
                                </div>
                              </>
                          )}
                        </div>
                    ))}

                    {filteredTasks.length === 0 && (
                        <p className="empty">
                          {tasks.length === 0
                              ? "No tasks yet. Add your first task above."
                              : "No tasks found for this filter."}
                        </p>
                    )}
                  </div>
                </>
            )}
          </section>
        </main>
      </div>
  );
}

export default App;
