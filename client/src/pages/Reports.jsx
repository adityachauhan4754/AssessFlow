import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../services/api';
import { showToast } from '../components/ui/Toast';
import debounce from 'lodash.debounce';
import {
  PageHeader, StatCard, DataTable, Drawer, Avatar, Badge,
  Accordion, AccordionItem, EmptyState, Button, Modal,
  StatCardSkeleton,
} from '../components/ui';

const Reports = () => {
  const [responses, setResponses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('Latest');
  
  // Drawer State
  const [drawerData, setDrawerData] = useState(null);
  const [loadingDrawer, setLoadingDrawer] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Export Modal
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const { data } = await api.get('/response');
        if (Array.isArray(data)) {
          setResponses(data);
          setFiltered(data);
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (error) {
        showToast.error('Failed to load responses');
      } finally {
        setLoading(false);
      }
    };
    fetchResponses();
  }, []);

  const handleSearchAndSort = useCallback(
    debounce((query, sort, items) => {
      let result = [...items];
      if (query) {
        const lowerCaseQuery = query.toLowerCase();
        result = result.filter(r => 
          (r.assessmentId?.title || '').toLowerCase().includes(lowerCaseQuery) ||
          (r.respondentName || '').toLowerCase().includes(lowerCaseQuery)
        );
      }
      
      result.sort((a, b) => {
        const dateA = new Date(a.submittedAt).getTime();
        const dateB = new Date(b.submittedAt).getTime();
        return sort === 'Latest' ? dateB - dateA : dateA - dateB;
      });
      
      setFiltered(result);
    }, 300),
    []
  );

  useEffect(() => {
    handleSearchAndSort(searchQuery, sortOrder, responses);
    return () => handleSearchAndSort.cancel();
  }, [searchQuery, sortOrder, responses, handleSearchAndSort]);

  const openDrawer = async (id) => {
    setDrawerOpen(true);
    setLoadingDrawer(true);
    setDrawerData(null);
    
    try {
      const res = await api.get(`/response/${id}`);
      setDrawerData(res.data);
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Failed to load response details');
    } finally {
      setLoadingDrawer(false);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setDrawerData(null), 300);
  };

  const flattenDrawerData = useMemo(() => {
    if (!drawerData?.structure) return [];
    const questions = [];
    drawerData.structure.forEach((cat) => {
      cat.factors.forEach((fac) => {
        fac.questions.forEach((q) => {
          questions.push({
             category: cat.category,
             factor: fac.factor,
             ...q
          });
        });
      });
    });
    return questions;
  }, [drawerData]);

  const renderAnswer = (type, answer) => {
    if (type === 'rating') {
      return (
        <div className="flex gap-1 mt-1 text-yellow-500">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className="material-symbols-outlined text-[18px]">
              {star <= Number(answer) ? 'star' : 'star_border'}
            </span>
          ))}
        </div>
      );
    }

    let displayAnswer = answer;
    if (typeof answer === 'object' && answer !== null) {
      displayAnswer = Array.isArray(answer) ? answer.join(', ') : JSON.stringify(answer);
    }

    if (type === 'text' && typeof displayAnswer === 'string') {
      return (
        <div className="p-sm bg-surface-container-low border-l-4 border-outline rounded text-on-surface-variant mt-2">
          <p className="font-bold text-xs uppercase mb-1">Response:</p>
          <p className="text-sm italic">"{displayAnswer}"</p>
        </div>
      );
    }
    
    return (
      <div className="p-sm bg-surface-container-low border-l-4 border-primary rounded text-on-surface-variant mt-2">
         <p className="font-bold text-xs uppercase mb-1">Response:</p>
         <p className="text-sm font-medium">{String(displayAnswer)}</p>
      </div>
    );
  };

  // DataTable columns
  const columns = [
    {
      key: 'candidate',
      label: 'Candidate',
      sortable: true,
      sortAccessor: (row) => row.respondentName,
      render: (row) => (
        <div className="flex items-center gap-md">
          <Avatar name={row.respondentName} size="md" />
          <p className="font-label-md text-on-surface">{row.respondentName}</p>
        </div>
      ),
    },
    {
      key: 'assessment',
      label: 'Assessment',
      sortable: true,
      sortAccessor: (row) => row.assessmentId?.title || '',
      render: (row) => (
        <p className="font-label-md text-on-surface">{row.assessmentId?.title || 'Unknown'}</p>
      ),
    },
    {
      key: 'score',
      label: 'Score',
      sortable: true,
      sortAccessor: (row) => row.scorePercent || 0,
      render: (row) => (
        row.scorePercent !== undefined ? (
          <div className="flex flex-col">
            <span className="font-label-md text-on-surface font-bold">{row.scorePercent}%</span>
            <div className="flex gap-0.5 text-yellow-500 text-[14px]">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="material-symbols-outlined text-[14px]">
                  {star <= (row.starRating || 0) ? 'star' : 'star_border'}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <span className="text-on-surface-variant italic text-sm">Pending</span>
        )
      )
    },
    {
      key: 'date',
      label: 'Date Taken',
      sortable: true,
      sortAccessor: (row) => new Date(row.submittedAt).getTime(),
      render: (row) => (
        <div>
          <p className="font-body-md text-body-md text-on-surface">
            {new Date(row.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-xs text-outline">
            {new Date(row.submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Button
          variant="secondary"
          size="sm"
          iconRight="visibility"
          onClick={(e) => { e.stopPropagation(); openDrawer(row._id); }}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-container-max mx-auto pb-10 relative overflow-hidden min-h-[calc(100vh-64px)]">
      <PageHeader
        title="Assessment Reports"
        subtitle="Detailed insights into candidate performance and progress."
        actions={
          <div className="flex flex-wrap items-center gap-md">
            {/* Search */}
            <div className="relative group">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-outline mb-1 px-1">Search Candidates</label>
              <div className="flex items-center gap-md bg-surface border border-outline-variant px-md py-xs rounded-lg transition-colors min-w-[240px] focus-within:border-primary">
                <span className="material-symbols-outlined text-outline">search</span>
                <input 
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none w-full text-label-md py-1"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            {/* Sort */}
            <div className="relative group">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-outline mb-1 px-1">Sort Order</label>
              <div className="relative flex items-center gap-md bg-surface border border-outline-variant px-md py-xs rounded-lg transition-colors focus-within:border-primary">
                <select 
                  className="bg-transparent border-none outline-none text-label-md py-1 pr-8 appearance-none cursor-pointer w-full"
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value)}
                >
                  <option value="Latest">Latest</option>
                  <option value="Oldest">Oldest</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">
                  expand_more
                </span>
              </div>
            </div>
            {/* Export */}
            <div className="relative group">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-outline mb-1 px-1">&nbsp;</label>
              <button
                onClick={() => setExportOpen(true)}
                className="flex items-center gap-sm bg-surface border border-outline-variant px-md py-sm rounded-lg text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container hover:border-primary transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
              </button>
            </div>
          </div>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md mb-xl">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div>
              <StatCard
                icon="check_circle"
                iconBg="bg-secondary-fixed"
                iconColor="text-on-secondary-fixed"
                label="Total Submissions"
                value={responses.length}
                tag="Active"
                tagVariant="success"
              />
            </div>
            <div>
              <StatCard
                icon="timer"
                iconBg="bg-tertiary-fixed"
                iconColor="text-on-tertiary-fixed"
                label="Completion Rate"
                value={responses.length > 0 ? '100%' : '0%'}
                tag="Average"
              />
            </div>
            <div>
              <StatCard
                icon="grade"
                iconBg="bg-primary-fixed"
                iconColor="text-on-primary-fixed"
                label="Avg. Score"
                value={responses.length > 0 ? 'N/A' : '-'}
                tag="Top Tier"
              />
            </div>
          </>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyIcon="monitoring"
        emptyTitle="No submissions yet"
        emptySubtitle="Submissions will appear here once candidates complete assessments."
        pagination
        pageSize={10}
      />

      {/* Response Detail Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={loadingDrawer ? 'Loading...' : 'Response Summary'}
        subtitle={drawerData ? `Respondent: ${drawerData.respondent}` : ''}
        footer={
          <Button variant="secondary" onClick={closeDrawer}>Close</Button>
        }
      >
        {loadingDrawer ? (
          <div className="flex justify-center items-center h-40">
            <span className="material-symbols-outlined text-[32px] text-on-surface-variant animate-spin">progress_activity</span>
          </div>
        ) : drawerData ? (
          <div className="space-y-lg">
            {/* Candidate Info Card */}
            <div className="flex flex-col gap-sm mb-xl border-b border-outline-variant pb-md">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-xs">
                    {drawerData.assessment.title}
                  </h2>
                  <div className="flex items-center gap-md text-on-surface-variant font-body-sm">
                    <div className="flex items-center gap-xs">
                      <Avatar name={drawerData.respondent} size="sm" />
                      <span>{drawerData.respondent}</span>
                    </div>
                    <span>•</span>
                    <span>{new Date(drawerData.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {drawerData.scorePercent !== undefined && (
                  <div className="flex flex-col items-end bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant">
                    <span className="font-label-sm text-outline uppercase tracking-wider mb-1">Total Score</span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-headline-lg font-bold text-primary">{drawerData.scorePercent}%</span>
                      <span className="text-sm text-on-surface-variant">({drawerData.earnedPoints}/{drawerData.totalPoints} pts)</span>
                    </div>
                    <div className="flex gap-0.5 text-yellow-500 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="material-symbols-outlined text-[18px]">
                          {star <= (drawerData.starRating || 0) ? 'star' : 'star_border'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Question Breakdown */}
            <div className="space-y-sm">
              <p className="font-label-md text-label-md text-outline uppercase tracking-wider">Question Breakdown</p>
              
              {flattenDrawerData.length === 0 ? (
                <p className="text-on-surface-variant">No answers available.</p>
              ) : (
                <Accordion defaultExpanded={[]}>
                  {flattenDrawerData.map((q, idx) => (
                    <AccordionItem 
                      key={idx}
                      id={idx}
                      label={`${idx + 1}. ${q.question}`}
                      statusIcon={q.isCorrect === true ? "check_circle" : q.isCorrect === false ? "cancel" : "assignment"}
                      statusColor={q.isCorrect === true ? "text-success" : q.isCorrect === false ? "text-error" : "text-primary"}
                    >
                      <div className="p-md text-body-md">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-bold text-xs text-outline uppercase">{q.category} / {q.factor}</p>
                          {q.isCorrect !== undefined && (
                            <span className={`font-bold text-xs ${q.isCorrect ? 'text-success' : 'text-error'}`}>
                              {q.pointsAwarded} / {q.possiblePoints} pts
                            </span>
                          )}
                        </div>
                        <p className="mb-md text-on-surface-variant">{q.question}</p>
                        {renderAnswer(q.type, q.answer)}
                      </div>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </div>
        ) : (
           <div className="text-center py-10 text-on-surface-variant">Failed to load response data.</div>
        )}
      </Drawer>

      {/* Export Modal */}
      <Modal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        icon="download"
        iconBg="bg-primary-fixed"
        iconColor="text-on-primary-fixed"
        title="Export Reports"
        subtitle="Choose a format and scope to export your data."
        footer={
          <>
            <Button variant="secondary" onClick={() => setExportOpen(false)}>Cancel</Button>
            <Button
              variant="primary-emphasis"
              icon="download"
              onClick={() => {
                showToast.success(`Export started (${exportFormat.toUpperCase()})`);
                setExportOpen(false);
              }}
            >
              Export
            </Button>
          </>
        }
      >
        <div className="space-y-md">
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-xs">Format</label>
            <div className="flex gap-sm">
              {['csv', 'pdf', 'xlsx'].map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  className={`px-lg py-sm rounded-lg font-label-md text-label-md uppercase transition-all ${
                    exportFormat === fmt
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface border border-outline-variant text-on-surface-variant hover:border-primary'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-xs">Scope</label>
            <div className="relative">
              <select className="appearance-none w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-md pr-8 font-body-md outline-none focus:border-primary">
                <option>Current filter results ({filtered.length} records)</option>
                <option>All records ({responses.length} records)</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">
                expand_more
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reports;
