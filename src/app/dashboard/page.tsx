'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import styles from './dashboard.module.css';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      });
  }, []);

  if (loading) return <AppLayout><div className="container">Loading dashboard...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="container">
        <h1 className={styles.pageTitle}>Dashboard Overview</h1>
        
        <div className={styles.statsGrid}>
          <div className="card">
            <h3>Total Tasks</h3>
            <p className={styles.statNumber}>{data?.stats?.total || 0}</p>
          </div>
          <div className="card">
            <h3>To Do</h3>
            <p className={`${styles.statNumber} ${styles.textTodo}`}>{data?.stats?.todo || 0}</p>
          </div>
          <div className="card">
            <h3>In Progress</h3>
            <p className={`${styles.statNumber} ${styles.textInProgress}`}>{data?.stats?.inProgress || 0}</p>
          </div>
          <div className="card">
            <h3>Done</h3>
            <p className={`${styles.statNumber} ${styles.textDone}`}>{data?.stats?.done || 0}</p>
          </div>
          <div className="card">
            <h3>Overdue</h3>
            <p className={`${styles.statNumber} ${styles.textDanger}`}>{data?.stats?.overdue || 0}</p>
          </div>
        </div>

        <h2 className={styles.sectionTitle}>Recent Tasks</h2>
        <div className={styles.taskList}>
          {data?.tasks?.slice(0, 5).map((task: any) => (
            <div key={task.id} className={`card ${styles.taskCard}`}>
              <div>
                <h4>{task.title}</h4>
                <p className={styles.taskMeta}>Project: {task.project.name}</p>
              </div>
              <span className={`badge badge-${task.status.toLowerCase().replace('_', '-')}`}>{task.status.replace('_', ' ')}</span>
            </div>
          ))}
          {(!data?.tasks || data.tasks.length === 0) && (
            <p className={styles.emptyState}>No tasks found. Create a project to get started.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
