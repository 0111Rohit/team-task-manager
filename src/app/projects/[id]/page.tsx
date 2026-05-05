'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import styles from './project-detail.module.css';
import { useParams } from 'next/navigation';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskAssignee, setTaskAssignee] = useState('');

  // Member form state
  const [memberEmail, setMemberEmail] = useState('');

  const fetchProject = () => {
    fetch(`/api/projects/${id}`)
      .then(res => res.json())
      .then(data => {
        setProject(data.project);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProject();
    fetch('/api/auth/me').then(res => res.json()).then(data => setCurrentUser(data.user));
  }, [id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/projects/${id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDesc,
          priority: taskPriority,
          assignedToId: taskAssignee || null
        })
      });
      if (res.ok) {
        setShowTaskModal(false);
        setTaskTitle('');
        setTaskDesc('');
        fetchProject();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/projects/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: memberEmail })
      });
      if (res.ok) {
        setShowMemberModal(false);
        setMemberEmail('');
        fetchProject();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchProject();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <AppLayout><div className="container">Loading project...</div></AppLayout>;
  if (!project) return <AppLayout><div className="container">Project not found</div></AppLayout>;

  const isAdmin = project.createdById === currentUser?.id;

  return (
    <AppLayout>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>{project.name}</h1>
            <p className={styles.description}>{project.description}</p>
          </div>
          <div className={styles.headerActions}>
            <button className="btn" onClick={() => setShowTaskModal(true)}>+ Add Task</button>
            {isAdmin && (
              <button className="btn" style={{background: 'rgba(255,255,255,0.1)'}} onClick={() => setShowMemberModal(true)}>
                + Invite Member
              </button>
            )}
          </div>
        </div>

        <div className={styles.grid}>
          <div>
            <h2 className={styles.sectionTitle}>Tasks</h2>
            <div className={styles.tasksList}>
              {project.tasks.map((task: any) => (
                <div key={task.id} className={`card ${styles.taskCard}`}>
                  <div className={styles.taskHeader}>
                    <h3 className={styles.taskTitle}>{task.title}</h3>
                    <select 
                      className={styles.selectInput} 
                      style={{width: 'auto'}}
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                  <p className={styles.taskDesc}>{task.description}</p>
                  <div className={styles.taskFooter}>
                    <span>Priority: {task.priority}</span>
                    <span>Assigned to: {task.assignedTo?.name || 'Unassigned'}</span>
                  </div>
                </div>
              ))}
              {project.tasks.length === 0 && <p>No tasks yet.</p>}
            </div>
          </div>

          <div>
            <h2 className={styles.sectionTitle}>Team Members</h2>
            <div className={styles.membersList}>
              {project.members.map((member: any) => (
                <div key={member.id} className={styles.memberItem}>
                  <div className={styles.memberAvatar}>{member.user.name[0].toUpperCase()}</div>
                  <div>
                    <div style={{fontWeight: 500}}>{member.user.name}</div>
                    <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task Modal */}
        {showTaskModal && (
          <div className={styles.modalOverlay}>
            <div className={`card ${styles.modalContent}`}>
              <h2>Create New Task</h2>
              <form onSubmit={handleCreateTask}>
                <div className="input-group">
                  <label>Title</label>
                  <input type="text" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Description</label>
                  <textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} rows={3} />
                </div>
                <div className="input-group">
                  <label>Assign To</label>
                  <select value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)}>
                    <option value="">Unassigned</option>
                    {project.members.map((m: any) => (
                      <option key={m.userId} value={m.userId}>{m.user.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className="btn" style={{background: 'transparent', border: '1px solid var(--text-muted)'}} onClick={() => setShowTaskModal(false)}>Cancel</button>
                  <button type="submit" className="btn">Create Task</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Member Modal */}
        {showMemberModal && (
          <div className={styles.modalOverlay}>
            <div className={`card ${styles.modalContent}`}>
              <h2>Invite Member</h2>
              <form onSubmit={handleAddMember}>
                <div className="input-group">
                  <label>User Email</label>
                  <input type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className="btn" style={{background: 'transparent', border: '1px solid var(--text-muted)'}} onClick={() => setShowMemberModal(false)}>Cancel</button>
                  <button type="submit" className="btn">Invite</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
