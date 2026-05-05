'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import styles from './projects.module.css';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const fetchProjects = () => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data.projects || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName, description: newProjectDesc })
      });
      if (res.ok) {
        setShowModal(false);
        setNewProjectName('');
        setNewProjectDesc('');
        fetchProjects();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AppLayout>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Projects</h1>
          <button className="btn" onClick={() => setShowModal(true)}>+ New Project</button>
        </div>

        {loading ? (
          <p>Loading projects...</p>
        ) : (
          <div className={styles.projectsGrid}>
            {projects.map((project: any) => (
              <Link href={`/projects/${project.id}`} key={project.id}>
                <div className={`card ${styles.projectCard}`}>
                  <h3>{project.name}</h3>
                  <p>{project.description || 'No description'}</p>
                  <div className={styles.projectStats}>
                    <span>Tasks: {project._count.tasks}</span>
                    <span>Members: {project._count.members}</span>
                  </div>
                </div>
              </Link>
            ))}
            {projects.length === 0 && (
              <div className={styles.emptyState}>No projects found. Create one to start collaborating!</div>
            )}
          </div>
        )}

        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={`card ${styles.modalContent}`}>
              <h2>Create New Project</h2>
              <form onSubmit={handleCreateProject}>
                <div className="input-group">
                  <label>Name</label>
                  <input type="text" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Description</label>
                  <textarea value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)} rows={3} />
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className="btn" style={{background: 'transparent', border: '1px solid var(--text-muted)'}} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn">Create Project</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
