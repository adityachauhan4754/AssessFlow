import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import { showToast } from '../components/ui/Toast';
import { PageHeader, Badge, Modal, Button, EmptyState, CardSkeleton } from '../components/ui';

const Dashboard = () => {
  const [assessments, setAssessments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Latest');
  const navigate = useNavigate();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState(null);

  const fetchAssessments = async () => {
    try {
      const { data } = await api.get('/assessment');
      if (Array.isArray(data)) {
        setAssessments(data);
        setFiltered(data);
      } else {
        throw new Error("Invalid data format received");
      }
    } catch (error) {
      showToast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleSearchFilterSort = useMemo(
    () => debounce((query, status, sort, items) => {
      let result = [...items];
      
      if (query) {
        const lowerCaseQuery = query.toLowerCase();
        result = result.filter(a => a.title.toLowerCase().includes(lowerCaseQuery));
      }
      
      if (status !== 'All') {
        result = result.filter(a => (a.status || 'draft').toLowerCase() === status.toLowerCase());
      }
      
      result.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sort === 'Latest' ? dateB - dateA : dateA - dateB;
      });

      setFiltered(result);
    }, 300),
    []
  );

  useEffect(() => {
    handleSearchFilterSort(searchQuery, statusFilter, sortOrder, assessments);
    return () => handleSearchFilterSort.cancel();
  }, [searchQuery, statusFilter, sortOrder, assessments, handleSearchFilterSort]);

  const confirmDelete = (id) => {
    setAssessmentToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!assessmentToDelete) return;
    try {
      await api.delete(`/assessment/${assessmentToDelete}`);
      showToast.success('Assessment deleted');
      fetchAssessments();
    } catch (error) {
      showToast.error('Failed to delete');
    } finally {
      setDeleteConfirmOpen(false);
      setAssessmentToDelete(null);
    }
  };

  return (
    <div className="max-w-container-max mx-auto">
      <PageHeader
        title="Assessments"
        subtitle="Manage and deploy technical evaluations for your engineering pipeline."
        actions={
          <Link to="/builder" className="bg-primary-container text-on-primary-container px-lg py-md rounded-lg font-label-md text-label-md flex items-center justify-center gap-sm shadow-lg hover:shadow-xl transition-all active:scale-95">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create New
          </Link>
        }
      />

      {/* Filters & Search Bar */}
      <div className="flex items-center gap-md mb-lg flex-wrap">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            className="w-full pl-10 pr-4 py-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
            placeholder="Search assessments..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <select 
            className="appearance-none px-md pr-8 py-sm bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary text-label-md font-label-md cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Status: All</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">
            expand_more
          </span>
        </div>
        
        <div className="relative">
          <select 
            className="appearance-none px-md pr-8 py-sm bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary text-label-md font-label-md cursor-pointer"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="Latest">Sort: Latest</option>
            <option value="Oldest">Sort: Oldest</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">
            expand_more
          </span>
        </div>
      </div>

      {/* Active filter chips */}
      {(statusFilter !== 'All' || searchQuery) && (
        <div className="flex items-center gap-sm mb-lg flex-wrap">
          {statusFilter !== 'All' && (
            <span className="inline-flex items-center gap-xs px-md py-xs bg-primary-fixed text-on-primary-fixed rounded-full text-label-md font-label-md">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter('All')} className="hover:text-error transition-colors">
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-xs px-md py-xs bg-primary-fixed text-on-primary-fixed rounded-full text-label-md font-label-md">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-error transition-colors">
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </span>
          )}
          <button
            onClick={() => { setStatusFilter('All'); setSearchQuery(''); }}
            className="text-label-md font-label-md text-primary hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))
        ) : filtered.length === 0 && (searchQuery || statusFilter !== 'All') ? (
          <div className="col-span-full">
            <EmptyState
              icon="search_off"
              title={`No results for "${searchQuery || statusFilter}"`}
              subtitle="Try adjusting your search or filters."
              actionText="Clear filters"
              onAction={() => { setSearchQuery(''); setStatusFilter('All'); }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon="assignment"
              title="No assessments yet"
              subtitle="Create your first assessment to get started with AssessFlow."
              actionText="Create Assessment"
              actionIcon="add"
              onAction={() => navigate('/builder')}
            />
          </div>
        ) : (
          <>
            {filtered.map(a => {
              const isDraft = a.status === 'draft';
              
              return (
                <div key={a._id} className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden group hover:border-primary transition-all duration-300 flex flex-col relative">
                  <div className={`absolute top-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ${isDraft ? 'bg-secondary' : 'bg-primary'}`}></div>
                  
                  {/* Delete Button */}
                  <button 
                    onClick={() => confirmDelete(a._id)}
                    className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-error bg-surface/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Delete Assessment"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                  
                  <div className="p-lg flex-1">
                    <div className="flex justify-between items-start mb-md pr-10">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDraft ? 'bg-secondary-fixed text-secondary' : 'bg-primary-fixed text-primary'}`}>
                         <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {isDraft ? 'palette' : 'terminal'}
                         </span>
                      </div>
                      <Badge variant={isDraft ? 'draft' : 'active'} dot>
                        {isDraft ? 'Draft' : 'Active'}
                      </Badge>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-sm line-clamp-1" title={a.title}>{a.title}</h3>
                    <p className="text-body-md text-on-surface-variant mb-lg line-clamp-2 min-h-[40px]">
                      {a.description || 'Product Roadmap Assessment'}
                    </p>
                    <div className="text-label-sm font-label-sm text-outline flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      Created {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="p-md bg-surface-container-low flex gap-sm border-t border-outline-variant">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/builder/${a._id}`); }}
                      className="flex-1 py-sm bg-surface border border-outline-variant text-on-surface-variant font-label-md text-label-md rounded-lg hover:bg-surface-container-high transition-all active:scale-95"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => navigate('/launchpad', { state: { assessmentId: a._id } })}
                      className="flex-[1.5] py-sm bg-primary text-on-primary font-label-md text-label-md rounded-lg flex items-center justify-center gap-xs hover:shadow-md transition-all active:scale-95"
                    >
                      Launch
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* New Assessment Placeholder Card */}
            <Link to="/builder" className="border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center p-xl group cursor-pointer hover:border-primary hover:bg-primary/5 transition-all min-h-[250px]">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-md group-hover:bg-primary-fixed transition-all">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant group-hover:text-primary transition-all">add_circle</span>
              </div>
              <span className="font-headline-md text-headline-md text-on-surface-variant group-hover:text-primary transition-all">New Template</span>
              <p className="text-body-md text-outline mt-xs text-center px-lg">Start from a pre-defined schema or build from scratch.</p>
            </Link>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        icon="warning"
        iconBg="bg-error-container"
        iconColor="text-on-error-container"
        title="Confirm Deletion"
        subtitle="Are you sure you want to delete this assessment? This action cannot be undone."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} icon="delete">Delete</Button>
          </>
        }
      />
    </div>
  );
};

export default Dashboard;
