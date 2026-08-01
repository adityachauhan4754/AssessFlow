import React, { useState, useEffect } from 'react';
import { PageHeader, DataTable, EmptyState, Button } from '../components/ui';
import { showToast } from '../components/ui/Toast';
import api from '../services/api';

const actionIconMap = {
  created: { icon: 'add_circle', color: 'text-success' },
  updated: { icon: 'edit', color: 'text-primary' },
  deleted: { icon: 'delete', color: 'text-error' },
  published: { icon: 'publish', color: 'text-secondary' },
  invited: { icon: 'person_add', color: 'text-tertiary' }
};

const ProjectHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [page, filterType]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/projects/current/history?page=${page}&type=${filterType}`);
      setLogs(data.logs);
      setTotalPages(data.pages);
    } catch (error) {
      showToast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Action',
      accessor: (log) => {
        const { icon, color } = actionIconMap[log.action] || { icon: 'info', color: 'text-on-surface-variant' };
        return (
          <div className="flex items-center gap-md">
            <div className={`w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center ${color}`}>
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
            </div>
            <div>
              <p className="font-label-md text-on-surface font-bold capitalize">{log.action} {log.targetType}</p>
              <p className="text-body-sm text-on-surface-variant line-clamp-1">{log.targetLabel}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Actor',
      accessor: (log) => (
        <div className="flex items-center gap-sm">
          <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[10px] font-bold">
            {log.actorName.substring(0, 2).toUpperCase()}
          </div>
          <span className="font-body-md text-on-surface">{log.actorName}</span>
        </div>
      )
    },
    {
      header: 'Time',
      accessor: (log) => {
        const date = new Date(log.createdAt);
        return (
          <div className="text-on-surface-variant">
            <p className="font-body-md" title={date.toLocaleString()}>{date.toLocaleDateString()}</p>
            <p className="text-[11px]">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        );
      }
    }
  ];

  return (
    <div className="max-w-container-max mx-auto pb-10">
      <PageHeader
        title="Project History"
        subtitle="A record of recent activity on this project."
        breadcrumbs={[
          { label: 'Project Settings' },
          { label: 'History' },
        ]}
      />

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-md mb-xl flex flex-wrap gap-md items-center">
        <span className="material-symbols-outlined text-outline">filter_list</span>
        <div className="relative">
          <select 
            className="appearance-none pr-8 bg-surface border border-outline-variant rounded-lg px-md py-sm text-label-md outline-none focus:border-primary"
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          >
            <option value="">All Activity Types</option>
            <option value="assessment">Assessments</option>
            <option value="category">Categories</option>
            <option value="setting">Project Settings</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">
            expand_more
          </span>
        </div>
        
        <div className="flex-1" />
        <Button variant="secondary" icon="refresh" onClick={fetchHistory}>Refresh</Button>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          data={logs}
          isLoading={loading}
          emptyState={
            <EmptyState
              icon="history"
              title="No activity yet"
              subtitle="When actions are taken in this project, they will appear here."
            />
          }
        />
        
        {totalPages > 1 && (
          <div className="border-t border-outline-variant p-md flex items-center justify-between bg-surface-container-lowest">
            <span className="text-label-sm text-on-surface-variant">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-sm">
              <Button 
                variant="secondary" 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="secondary" 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectHistory;
