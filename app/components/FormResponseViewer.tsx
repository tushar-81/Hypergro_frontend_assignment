import React, { useState, useEffect, useRef } from 'react';
import { Form, FormSubmission } from '~/types/form';
import { BarChart3, Download, Calendar, User, Filter, Search, FileText, Trash2, ArrowLeft, Users, Clock, SortAsc, SortDesc, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

interface FormResponseViewerProps {
  form: Form;
  isOpen: boolean; 
  onClose: () => void;
  onBack?: () => void;
}

interface FieldAnalytics {
  fieldId: string;
  fieldLabel: string;
  fieldType: string;
  values: Record<string, number>;
  totalResponses: number;
}

export const FormResponseViewer: React.FC<FormResponseViewerProps> = ({
  form,
  isOpen,
  onClose,
  onBack
}) => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'responses' | 'analytics'>('responses');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'id'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [analytics, setAnalytics] = useState<FieldAnalytics[]>([]);

  // Only handle escape key - NO CLICK OUTSIDE HANDLER AT ALL
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      loadSubmissions();
    }
  }, [isOpen, form.id]);

  const loadSubmissions = () => {
    setLoading(true);
    try {
      const savedSubmissions = localStorage.getItem(`submissions_${form.id}`);
      const submissionData = savedSubmissions ? JSON.parse(savedSubmissions) : [];
      
      const processedSubmissions = submissionData.map((sub: any) => ({
        ...sub,
        submittedAt: new Date(sub.submittedAt)
      }));

      setSubmissions(processedSubmissions);
      generateAnalytics(processedSubmissions);
    } catch (error) {
      console.error('Error loading submissions:', error);
      setSubmissions([]);
      setAnalytics([]);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalytics = (submissionData: FormSubmission[]) => {
    const analyticsData: FieldAnalytics[] = [];

    form.fields.forEach(field => {
      const fieldAnalytics: FieldAnalytics = {
        fieldId: field.id,
        fieldLabel: field.label,
        fieldType: field.type,
        values: {},
        totalResponses: 0
      };

      submissionData.forEach(submission => {
        const value = submission.data[field.id];
        if (value !== undefined && value !== null && value !== '') {
          fieldAnalytics.totalResponses++;
          
          let displayValue: string;
          if (field.type === 'checkbox') {
            displayValue = value ? 'Checked' : 'Unchecked';
          } else if (field.type === 'dropdown' || field.type === 'radio') {
            displayValue = value.toString();
          } else if (field.type === 'date') {
            displayValue = new Date(value).toLocaleDateString();
          } else {
            displayValue = value.toString();
          }

          fieldAnalytics.values[displayValue] = (fieldAnalytics.values[displayValue] || 0) + 1;
        }
      });

      analyticsData.push(fieldAnalytics);
    });

    setAnalytics(analyticsData);
  };

  const exportToCSV = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    if (filteredSubmissions.length === 0) return;

    const headers = ['Submission ID', 'Submitted At', ...form.fields.map(field => field.label)];
    
    const rows = filteredSubmissions.map(submission => {
      const row = [
        submission.id,
        submission.submittedAt.toLocaleString(),
        ...form.fields.map(field => {
          const value = submission.data[field.id];
          if (field.type === 'checkbox') {
            return value ? 'Yes' : 'No';
          }
          return value || '';
        })
      ];
      return row;
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${form.title.replace(/[^a-z0-9]/gi, '_')}_responses.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const exportToJSON = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    const exportData = {
      form: {
        id: form.id,
        title: form.title,
        description: form.description
      },
      submissions: filteredSubmissions,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${form.title.replace(/[^a-z0-9]/gi, '_')}_responses.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const deleteSubmission = (submissionId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    if (confirm('Are you sure you want to delete this submission?')) {
      const updatedSubmissions = submissions.filter(sub => sub.id !== submissionId);
      setSubmissions(updatedSubmissions);
      localStorage.setItem(`submissions_${form.id}`, JSON.stringify(updatedSubmissions));
      generateAnalytics(updatedSubmissions);
    }
  };

  const clearAllSubmissions = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    if (confirm('Are you sure you want to delete all submissions? This action cannot be undone.')) {
      setSubmissions([]);
      setAnalytics([]);
      localStorage.removeItem(`submissions_${form.id}`);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = Object.values(submission.data).some(value => 
        value?.toString().toLowerCase().includes(searchLower)
      ) || submission.id.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    if (filterField !== 'all') {
      const fieldValue = submission.data[filterField];
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
    }

    if (dateFilter !== 'all') {
      const submissionDate = new Date(submission.submittedAt);
      const now = new Date();
      const diffTime = now.getTime() - submissionDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (dateFilter) {
        case 'today':
          if (diffDays > 1) return false;
          break;
        case 'week':
          if (diffDays > 7) return false;
          break;
        case 'month':
          if (diffDays > 30) return false;
          break;
        case 'year':
          if (diffDays > 365) return false;
          break;
      }
    }

    return true;
  }).sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    } else if (sortBy === 'id') {
      comparison = a.id.localeCompare(b.id);
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (!isOpen) return null;
  
  // Add this click handler to the modal content div to prevent event bubbling
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Also add event prevention to all form elements
  const handleInputChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.stopPropagation();
    setter(e.target.value);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={handleModalContentClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => onBack ? onBack() : onClose()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Form Responses</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">{form.title}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
              {submissions.length} responses
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Close"
            >
              <svg 
                className="h-5 w-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('responses');
              }}
              className={clsx(
                'py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'responses'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Responses</span>
              </div>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('analytics');
              }}
              className={clsx(
                'py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Loading responses...</p>
              </div>
            </div>
          ) : activeTab === 'responses' ? (
            <div className="p-6">
              {/* Controls */}
              <div className="mb-6 space-y-4">
                {/* Top row - Search and primary filters */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search responses..."
                        value={searchTerm}
                        onChange={handleInputChange(setSearchTerm)}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-64"
                      />
                    </div>

                    {/* Field Filter */}
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <select
                        value={filterField}
                        onChange={handleInputChange(setFilterField)}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                        className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-48"
                      >
                        <option value="all">All fields</option>
                        {form.fields.map(field => (
                          <option key={field.id} value={field.id}>{field.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date Filter */}
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <select
                        value={dateFilter}
                        onChange={handleInputChange(setDateFilter)}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                        className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-36"
                      >
                        <option value="all">All time</option>
                        <option value="today">Today</option>
                        <option value="week">This week</option>
                        <option value="month">This month</option>
                        <option value="year">This year</option>
                      </select>
                    </div>

                    {/* Clear filters button */}
                    {(searchTerm || filterField !== 'all' || dateFilter !== 'all') && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchTerm('');
                          setFilterField('all');
                          setDateFilter('all');
                        }}
                        className="flex items-center space-x-1 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        title="Clear all filters"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span className="text-sm">Clear</span>
                      </button>
                    )}
                  </div>

                  {/* Export buttons */}
                  <div className="flex items-center space-x-2">                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportToCSV(e);
                      }}
                      disabled={filteredSubmissions.length === 0}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Export filtered results to CSV"
                    >
                      <Download className="h-4 w-4" />
                      <span>CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportToJSON(e);
                      }}
                      disabled={filteredSubmissions.length === 0}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Export filtered results to JSON"
                    >
                      <Download className="h-4 w-4" />
                      <span>JSON</span>
                    </button>
                    {submissions.length > 0 && (                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAllSubmissions();
                        }}
                        className="flex items-center space-x-2 px-3 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                        title="Delete all submissions"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Clear All</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom row - Sort options and results count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Sort by:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => {
                          e.stopPropagation();
                          setSortBy(e.target.value as 'date' | 'id');
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                      >
                        <option value="date">Date</option>
                        <option value="id">ID</option>
                      </select>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                        className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                      >
                        {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {filteredSubmissions.length === submissions.length ? (
                      <span>Showing all {submissions.length} responses</span>
                    ) : (
                      <span>Showing {filteredSubmissions.length} of {submissions.length} responses</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Responses List */}
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No responses yet</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {submissions.length === 0 
                      ? "This form hasn't received any submissions yet."
                      : "No responses match your current filters."
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSubmissions.map((submission) => (
                    <div 
                      key={submission.id} 
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors bg-white dark:bg-gray-700"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Response #{submission.id.slice(-8)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>{submission.submittedAt.toLocaleDateString()}</span>
                            <span>{submission.submittedAt.toLocaleTimeString()}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => deleteSubmission(submission.id, e)}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete submission"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {form.fields.map((field) => {
                          const value = submission.data[field.id];
                          let displayValue: string;
                          
                          if (value === undefined || value === null || value === '') {
                            displayValue = '—';
                          } else if (field.type === 'checkbox') {
                            displayValue = value ? 'Yes' : 'No';
                          } else if (field.type === 'date') {
                            displayValue = new Date(value).toLocaleDateString();
                          } else {
                            displayValue = value.toString();
                          }

                          return (
                            <div key={field.id} className="border-l-2 border-gray-200 dark:border-gray-600 pl-3">
                              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                {field.label}
                              </div>
                              <div className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                                {displayValue}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              {/* Analytics View */}
              {analytics.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No data to analyze</h3>
                  <p className="text-gray-600 dark:text-gray-300">Submit some responses to see analytics.</p>
                </div>
              ) : (
                <div className="space-y-8">                  {/* Summary Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 dark:text-blue-200 text-sm font-medium">Total Responses</p>
                          <p className="text-3xl font-bold">{submissions.length}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-200 dark:text-blue-300" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 dark:text-purple-200 text-sm font-medium">Latest Response</p>
                          <p className="text-lg font-semibold">
                            {submissions.length > 0 ? 
                              (() => {
                                const latest = Math.max(...submissions.map(sub => sub.submittedAt.getTime()));
                                const daysDiff = Math.floor((Date.now() - latest) / (1000 * 60 * 60 * 24));
                                return daysDiff === 0 ? 'Today' : `${daysDiff} days ago`;
                              })() : 
                              'No responses'
                            }
                          </p>
                        </div>
                        <Clock className="h-8 w-8 text-purple-200 dark:text-purple-300" />
                      </div>
                    </div>
                  </div>

                  {/* Field Analytics */}
                  {analytics.map((fieldAnalytics) => (
                    <div key={fieldAnalytics.fieldId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {fieldAnalytics.fieldLabel}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {fieldAnalytics.fieldType} • {fieldAnalytics.totalResponses} responses
                            {fieldAnalytics.totalResponses < submissions.length && (
                              <span className="text-yellow-600 dark:text-yellow-400">
                                {' '}• {submissions.length - fieldAnalytics.totalResponses} incomplete
                              </span>
                            )}
                          </p>
                        </div>
                        {fieldAnalytics.totalResponses > 0 && (
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {Math.round((fieldAnalytics.totalResponses / submissions.length) * 100)}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">response rate</div>
                          </div>
                        )}
                      </div>

                      {fieldAnalytics.totalResponses === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No responses for this field</p>
                      ) : (
                        <div className="space-y-3">
                          {Object.entries(fieldAnalytics.values)
                            .sort(([,a], [,b]) => b - a)
                            .map(([value, count]) => {
                              const percentage = (count / fieldAnalytics.totalResponses) * 100;
                              const globalPercentage = (count / submissions.length) * 100;
                              return (
                                <div key={value} className="flex items-center">
                                  <div className="w-32 text-sm text-gray-700 dark:text-gray-300 truncate" title={value}>
                                    {value}
                                  </div>
                                  <div className="flex-1 mx-4">
                                    <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                                      <div
                                        className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                  <div className="w-24 text-sm text-gray-600 dark:text-gray-300 text-right">
                                    <div>{count} ({percentage.toFixed(1)}%)</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {globalPercentage.toFixed(1)}% of all
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
