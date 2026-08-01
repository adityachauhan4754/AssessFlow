import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import { showToast } from '../components/ui/Toast';
import { useNavigate, Link, useParams } from 'react-router-dom';
import debounce from 'lodash.debounce';
import { Modal, Button, Drawer, EmptyState } from '../components/ui';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- AUTO-SAVE INDICATOR ---
const AutoSaveIndicator = ({ status, lastSaved }) => {
  if (status === 'saving') {
    return (
      <span className="inline-flex items-center gap-xs text-label-sm font-label-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
        Saving...
      </span>
    );
  }
  if (status === 'saved') {
    return (
      <span className="inline-flex items-center gap-xs text-label-sm font-label-sm text-green-600">
        <span className="material-symbols-outlined text-[14px]">check_circle</span>
        Saved
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-xs text-label-sm font-label-sm text-error">
        <span className="material-symbols-outlined text-[14px]">error</span>
        Save failed
      </span>
    );
  }
  return null;
};

// --- SORTABLE COMPONENTS ---

const SortableQuestion = ({ q, qIdx, updateQuestion, removeQuestion, openSettings }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: q.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const [localText, setLocalText] = useState(q.text);
  const [localOptions, setLocalOptions] = useState(q.options ? q.options.join(',') : '');

  const handleBlurText = () => { if (localText !== q.text) updateQuestion('text', localText); };
  const handleBlurOptions = () => { 
    const optionsArray = localOptions.split(',').map(o => o.trim()).filter(Boolean);
    updateQuestion('options', optionsArray); 
  };

  return (
    <div ref={setNodeRef} style={style} className="accordion-item flex items-center justify-between p-md bg-surface-container-lowest border border-outline-variant rounded-lg hover:border-primary transition-colors group">
      <div className="flex items-center gap-md w-full">
        <div {...attributes} {...listeners} className="cursor-grab text-on-surface-variant hover:text-primary">
          <span className="material-symbols-outlined">drag_indicator</span>
        </div>
        
        <div className="flex flex-col gap-2 w-full pr-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <select 
                className="appearance-none bg-surface border border-outline-variant rounded px-2 pr-8 py-1 text-sm outline-none focus:border-primary"
                value={q.type} 
                onChange={e => updateQuestion('type', e.target.value)}
              >
                <option value="Text">Text</option>
                <option value="Number">Number</option>
                <option value="Rating">Rating</option>
                <option value="MCQ">MCQ</option>
              </select>
              <span className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[16px]">
                expand_more
              </span>
            </div>
            <input 
              className="flex-1 bg-transparent border-b border-transparent focus:border-primary outline-none font-body-md text-on-surface"
              placeholder="Question Text" 
              value={localText} 
              onChange={e => setLocalText(e.target.value)} 
              onBlur={handleBlurText} 
            />
          </div>
          
          {q.type === 'MCQ' && (
            <input 
              className="w-full bg-surface-container border border-outline-variant rounded px-3 py-1 text-sm outline-none focus:border-primary"
              placeholder="Options (comma separated)" 
              value={localOptions} 
              onChange={e => setLocalOptions(e.target.value)} 
              onBlur={handleBlurOptions} 
            />
          )}
        </div>
      </div>
      
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-sm transition-opacity shrink-0">
        <button onClick={() => openSettings(qIdx)} className="p-2 text-primary hover:bg-primary-container rounded-full transition-colors" title="Question Settings">
          <span className="material-symbols-outlined text-sm">settings</span>
        </button>
        <button onClick={removeQuestion} className="p-2 text-error hover:bg-error-container rounded-full transition-colors" title="Delete Question">
          <span className="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>
    </div>
  );
};

const SortableFactor = ({ fac, fIdx, cIdx, updateFactor, removeFactor, addQuestion, updateQuestion, removeQuestion, onDragEndQuestion, openSettings }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: fac.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const [isOpen, setIsOpen] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <div ref={setNodeRef} style={style} className={`bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden border-l-4 border-l-primary mb-md transition-all ${!isOpen ? 'opacity-80 hover:opacity-100' : ''}`}>
      <div className="p-md bg-surface-container flex items-center justify-between">
        <div className="flex items-center gap-md flex-1">
          <button onClick={() => setIsOpen(!isOpen)} className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">{isOpen ? 'expand_more' : 'chevron_right'}</span>
          </button>
          <div {...attributes} {...listeners} className="cursor-grab text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">drag_indicator</span>
          </div>
          <input 
            className="font-label-md text-label-md font-bold text-on-surface bg-transparent border-b border-transparent focus:border-primary outline-none flex-1"
            placeholder="Factor Name" 
            value={fac.name} 
            onChange={e => updateFactor(cIdx, fIdx, e.target.value)} 
          />
        </div>
        <div className="flex items-center gap-sm ml-4">
          <span className="text-xs text-on-surface-variant font-label-sm">{fac.questions.length} Questions</span>
          <button onClick={() => removeFactor(cIdx, fIdx)} className="p-1 text-on-surface-variant hover:text-error transition-colors" title="Delete Factor">
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div className="p-md space-y-sm">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => onDragEndQuestion(e, cIdx, fIdx)}>
            <SortableContext items={fac.questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
              {fac.questions.map((q, qIdx) => (
                <SortableQuestion key={q.id} q={q} qIdx={qIdx} 
                  updateQuestion={(field, value) => updateQuestion(cIdx, fIdx, qIdx, field, value)}
                  removeQuestion={() => removeQuestion(cIdx, fIdx, qIdx)}
                  openSettings={() => openSettings(cIdx, fIdx, qIdx)}
                />
              ))}
            </SortableContext>
          </DndContext>
          
          <button onClick={() => addQuestion(cIdx, fIdx)} className="w-full border-2 border-dashed border-outline-variant rounded-lg p-sm text-on-surface-variant font-label-md flex items-center justify-center gap-sm hover:bg-surface-container hover:border-primary hover:text-primary transition-all mt-2">
            <span className="material-symbols-outlined">add_circle</span>
            Add Question
          </button>
        </div>
      )}
    </div>
  );
};

const SortableCategory = ({ cat, cIdx, updateCategory, removeCategory, addFactor, updateFactor, removeFactor, addQuestion, updateQuestion, removeQuestion, onDragEndFactor, onDragEndQuestion, openSettings }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: cat.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const [isOpen, setIsOpen] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <div ref={setNodeRef} style={style} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm mb-lg">
      <div className="bg-surface p-md flex items-center justify-between border-b border-outline-variant group">
        <div className="flex items-center gap-md flex-1">
          <button onClick={() => setIsOpen(!isOpen)} className="text-primary font-bold transition-colors">
            <span className="material-symbols-outlined">{isOpen ? 'expand_more' : 'chevron_right'}</span>
          </button>
          <div {...attributes} {...listeners} className="cursor-grab text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">drag_indicator</span>
          </div>
          <div className="flex flex-col flex-1">
             <input 
               className="font-headline-md text-headline-md text-on-surface bg-transparent border-b border-transparent focus:border-primary outline-none w-full"
               placeholder="Category Name" 
               value={cat.name} 
               onChange={e => updateCategory(cIdx, e.target.value)} 
             />
             <span className="text-xs text-on-surface-variant font-label-sm">{cat.factors.length} Factors</span>
          </div>
        </div>
        <div className="flex items-center gap-sm opacity-0 group-hover:opacity-100 transition-opacity ml-4">
          <button onClick={() => removeCategory(cIdx)} className="p-sm text-on-surface-variant hover:text-error transition-colors" title="Delete Category">
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div className="p-lg space-y-md">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => onDragEndFactor(e, cIdx)}>
            <SortableContext items={cat.factors.map(f => f.id)} strategy={verticalListSortingStrategy}>
              {cat.factors.map((fac, fIdx) => (
                <SortableFactor key={fac.id} fac={fac} fIdx={fIdx} cIdx={cIdx}
                  updateFactor={updateFactor} removeFactor={removeFactor}
                  addQuestion={addQuestion} updateQuestion={updateQuestion} removeQuestion={removeQuestion}
                  onDragEndQuestion={onDragEndQuestion} openSettings={openSettings}
                />
              ))}
            </SortableContext>
          </DndContext>
          
          <button onClick={() => addFactor(cIdx)} className="flex items-center gap-sm py-sm px-md text-primary font-label-md hover:bg-primary-fixed rounded-lg transition-colors w-fit">
            <span className="material-symbols-outlined">playlist_add</span>
            Add Factor
          </button>
        </div>
      )}
    </div>
  );
};

// --- MAIN BUILDER ---

const Builder = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'error'

  const [showLoadDrawer, setShowLoadDrawer] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  
  const [status, setStatus] = useState('draft');
  const [passingThreshold, setPassingThreshold] = useState(50);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, indices: null });
  const [validationErrors, setValidationErrors] = useState([]);
  
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  const [settingsQuestion, setSettingsQuestion] = useState(null); // { cIdx, fIdx, qIdx }
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);
    try {
      const res = await api.post('/uploads/question-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const { cIdx, fIdx, qIdx } = settingsQuestion;
      const question = categories[cIdx].factors[fIdx].questions[qIdx];
      const newImages = [...(question.images || []), { url: res.data.url, alt: 'Question Image' }];
      updateQuestion(cIdx, fIdx, qIdx, 'images', newImages);
      showToast.success('Image uploaded successfully');
    } catch (err) {
      showToast.error(err?.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (imgIdx) => {
    const { cIdx, fIdx, qIdx } = settingsQuestion;
    const question = categories[cIdx].factors[fIdx].questions[qIdx];
    const newImages = [...(question.images || [])];
    newImages.splice(imgIdx, 1);
    updateQuestion(cIdx, fIdx, qIdx, 'images', newImages);
  };
  
  const navigate = useNavigate();
  const { id: assessmentId } = useParams();

  // Load draft on mount or fetch assessment if ID is present
  useEffect(() => {
    if (assessmentId) {
      setLoading(true);
      api.get(`/assessment/${assessmentId}`)
        .then(({ data }) => {
          setTitle(data.title);
          setDescription(data.description || '');
          setCategories(data.categories || []);
          setStatus(data.status || 'draft');
          setPassingThreshold(data.passingThreshold || 50);
        })
        .catch(() => showToast.error('Failed to load assessment'))
        .finally(() => setLoading(false));
    } else {
      const draft = localStorage.getItem('assessflow_draft');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (parsed.title || parsed.categories?.length > 0) {
            setTitle(parsed.title || '');
            setDescription(parsed.description || '');
            setCategories(parsed.categories || []);
            setStatus(parsed.status || 'draft');
            setPassingThreshold(parsed.passingThreshold || 50);
          }
        } catch (e) {
          localStorage.removeItem('assessflow_draft');
        }
      }
    }
  }, [assessmentId]);

  // Auto-save logic
  const saveDraft = useCallback(
    debounce((t, d, c, s, pt, id) => {
      // Don't auto-save to local draft if we are editing an existing assessment
      if (id) return;
      
      if (!t && c.length === 0) {
        localStorage.removeItem('assessflow_draft');
        return;
      }
      try {
        setSaveStatus('saving');
        localStorage.setItem('assessflow_draft', JSON.stringify({ title: t, description: d, categories: c, status: s, passingThreshold: pt }));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2000);
      } catch {
        setSaveStatus('error');
      }
    }, 3000),
    []
  );

  useEffect(() => {
    saveDraft(title, description, categories, status, passingThreshold, assessmentId);
  }, [title, description, categories, status, passingThreshold, assessmentId, saveDraft]);

  // Flush any pending saves on unmount
  useEffect(() => {
    return () => {
      saveDraft.flush();
    };
  }, [saveDraft]);

  // Modifiers
  const addCategory = () => setCategories([...categories, { id: generateId(), name: '', factors: [] }]);
  const updateCategory = (cIdx, name) => { 
    if (categories.some((c, i) => i !== cIdx && c.name.toLowerCase() === name.toLowerCase() && name !== '')) {
      showToast.error('Category name must be unique');
      return;
    }
    const newCats = [...categories]; newCats[cIdx].name = name; setCategories(newCats); 
  }
  const removeCategory = (cIdx) => setCategories(categories.filter((_, i) => i !== cIdx));

  const addFactor = (cIdx) => { const newCats = [...categories]; newCats[cIdx].factors.push({ id: generateId(), name: '', questions: [] }); setCategories(newCats); }
  const updateFactor = (cIdx, fIdx, name) => { const newCats = [...categories]; newCats[cIdx].factors[fIdx].name = name; setCategories(newCats); }
  const removeFactor = (cIdx, fIdx) => { const newCats = [...categories]; newCats[cIdx].factors = newCats[cIdx].factors.filter((_, i) => i !== fIdx); setCategories(newCats); }

  const addQuestion = (cIdx, fIdx) => { 
    const newCats = [...categories]; 
    newCats[cIdx].factors[fIdx].questions.push({ id: generateId(), text: '', type: 'Text', options: [], isRequired: true }); 
    setCategories(newCats); 
  }
  const updateQuestion = (cIdx, fIdx, qIdx, field, value) => {
    const newCats = [...categories]; 
    newCats[cIdx].factors[fIdx].questions[qIdx][field] = value; 
    setCategories(newCats); 
  }
  const removeQuestion = (cIdx, fIdx, qIdx) => {
    const newCats = [...categories]; 
    newCats[cIdx].factors[fIdx].questions = newCats[cIdx].factors[fIdx].questions.filter((_, i) => i !== qIdx); 
    setCategories(newCats); 
  }

  const confirmDelete = (type, indices) => {
    setDeleteDialog({ open: true, type, indices });
  };

  const executeDelete = () => {
    const { type, indices } = deleteDialog;
    if (type === 'category') removeCategory(indices.cIdx);
    if (type === 'factor') removeFactor(indices.cIdx, indices.fIdx);
    if (type === 'question') removeQuestion(indices.cIdx, indices.fIdx, indices.qIdx);
    setDeleteDialog({ open: false, type: null, indices: null });
  };

  // Load Categories Handlers
  const handleOpenLoadDrawer = async () => {
    setShowLoadDrawer(true);
    setLoadingCategories(true);
    try {
      const { data } = await api.get('/assessment/categories');
      setAvailableCategories(data);
    } catch (err) {
      showToast.error(err.customMessage || 'Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleLoadCategory = (catToLoad) => {
    if (categories.some(c => c.name.toLowerCase() === catToLoad.name.toLowerCase())) {
      showToast.error(`Category "${catToLoad.name}" is already added`);
      return;
    }

    const newCat = {
      ...catToLoad,
      id: generateId(),
      factors: catToLoad.factors.map(f => ({
        ...f,
        id: generateId(),
        questions: f.questions.map(q => ({
          ...q,
          id: generateId()
        }))
      }))
    };

    setCategories([...categories, newCat]);
    showToast.success(`Loaded category "${newCat.name}"`);
  };

  const filteredAvailableCategories = useMemo(() => {
    if (!categorySearch) return availableCategories;
    return availableCategories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [availableCategories, categorySearch]);

  // DND Handlers
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEndCategory = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCategories((cats) => {
        const oldIndex = cats.findIndex(c => c.id === active.id);
        const newIndex = cats.findIndex(c => c.id === over.id);
        return arrayMove(cats, oldIndex, newIndex);
      });
    }
  };

  const onDragEndFactor = (event, cIdx) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCategories((cats) => {
        const newCats = [...cats];
        const factors = newCats[cIdx].factors;
        const oldIndex = factors.findIndex(f => f.id === active.id);
        const newIndex = factors.findIndex(f => f.id === over.id);
        newCats[cIdx].factors = arrayMove(factors, oldIndex, newIndex);
        return newCats;
      });
    }
  };

  const onDragEndQuestion = (event, cIdx, fIdx) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCategories((cats) => {
        const newCats = [...cats];
        const questions = newCats[cIdx].factors[fIdx].questions;
        const oldIndex = questions.findIndex(q => q.id === active.id);
        const newIndex = questions.findIndex(q => q.id === over.id);
        newCats[cIdx].factors[fIdx].questions = arrayMove(questions, oldIndex, newIndex);
        return newCats;
      });
    }
  };

  const handleSave = async () => {
    const errors = [];
    if (!title || !title.trim()) errors.push('Assessment title is required');
    if (categories.length === 0) errors.push('Add at least one category');

    const catNames = new Set();
    for (const cat of categories) {
      if (!cat.name || !cat.name.trim()) { errors.push('All categories must have a name'); break; }
      if (catNames.has(cat.name.trim().toLowerCase())) { errors.push(`Duplicate category name: ${cat.name}`); break; }
      catNames.add(cat.name.trim().toLowerCase());
      
      if (cat.factors.length === 0) { errors.push(`Category "${cat.name}" must have at least one factor`); break; }
      const facNames = new Set();
      
      for (const fac of cat.factors) {
        if (!fac.name || !fac.name.trim()) { errors.push(`A factor in "${cat.name}" is missing a name`); break; }
        if (facNames.has(fac.name.trim().toLowerCase())) { errors.push(`Duplicate factor name "${fac.name}" in category "${cat.name}"`); break; }
        facNames.add(fac.name.trim().toLowerCase());
        
        if (fac.questions.length === 0) { errors.push(`Factor "${fac.name}" must have at least one question`); break; }
        
        for (const q of fac.questions) {
          if (!q.text || !q.text.trim()) { errors.push(`A question in factor "${fac.name}" is empty`); break; }
          if (q.type === 'MCQ' && (!q.options || q.options.length === 0)) {
            errors.push(`MCQ question "${q.text}" must have at least one option`);
          }
        }
      }
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);

    const payloadCategories = categories.map((c, cI) => ({
      ...c,
      order: cI,
      factors: c.factors.map((f, fI) => ({
        ...f,
        order: fI,
        questions: f.questions.map((q, qI) => ({
          ...q,
          order: qI
        }))
      }))
    }));

    setLoading(true);
    try {
      const payload = { title, description, categories: payloadCategories, status, passingThreshold };
      if (assessmentId) {
        await api.put(`/assessment/${assessmentId}`, payload);
        showToast.success('Assessment updated successfully!');
      } else {
        await api.post('/assessment', payload);
        showToast.success('Assessment saved successfully!');
        localStorage.removeItem('assessflow_draft');
      }
      navigate('/dashboard');
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-xl pb-32">
      {/* Validation Error Banner */}
      {validationErrors.length > 0 && (
        <div className="mb-lg bg-error-container border border-error rounded-lg p-md flex items-start gap-md animate-fadeIn">
          <span className="material-symbols-outlined text-on-error-container shrink-0 mt-0.5">error</span>
          <div>
            <p className="font-label-md text-on-error-container font-bold mb-xs">{validationErrors.length} issue{validationErrors.length > 1 ? 's' : ''} found</p>
            <ul className="text-[13px] text-on-error-container space-y-xs list-disc list-inside">
              {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
          <button onClick={() => setValidationErrors([])} className="shrink-0 text-on-error-container hover:opacity-70">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Action Row */}
      <div className="flex items-center justify-end gap-md mb-lg flex-wrap">
        <AutoSaveIndicator status={saveStatus} />
        <div className="relative">
          <select 
            className="appearance-none pl-md pr-8 py-sm bg-surface border border-outline-variant text-on-surface font-label-md rounded-lg outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">
            expand_more
          </span>
        </div>
        <Button variant="secondary" icon="folder_open" onClick={handleOpenLoadDrawer}>
          Load
        </Button>
        <Button
          variant="primary"
          icon="upload"
          loading={loading}
          onClick={handleSave}
        >
          {loading ? 'Saving...' : 'Save & Publish'}
        </Button>
      </div>

      {/* Workspace Header Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg mb-lg shadow-sm">

        <div className="flex flex-col">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Assessment Title</label>
          <input 
            type="text"
            className="font-headline-md text-headline-md font-bold text-on-surface bg-transparent border-none outline-none w-full placeholder-outline-variant mb-md"
            placeholder="e.g. Senior Frontend Engineer"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <div className="border-t border-outline-variant w-full mb-md"></div>
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Description</label>
          <textarea 
            className="text-on-surface font-body-md bg-transparent border-none outline-none w-full placeholder-outline-variant resize-none"
            placeholder="Add a description (optional)"
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* Feature Teasers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
        <div 
          onClick={handleOpenLoadDrawer}
          className="bg-surface-container-low border border-outline-variant rounded-lg p-md cursor-pointer hover:border-primary hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-sm mb-xs">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            </div>
            <h4 className="font-label-md font-bold text-on-surface">Smart Templates</h4>
          </div>
          <p className="font-body-md text-on-surface-variant line-clamp-2">Generate common categories using our pre-built assessment templates.</p>
        </div>

        <div 
          onClick={() => setShowScoringModal(true)}
          className="bg-surface-container-low border border-outline-variant rounded-lg p-md cursor-pointer hover:border-primary hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-sm mb-xs">
            <div className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px]">bar_chart</span>
            </div>
            <h4 className="font-label-md font-bold text-on-surface">Scoring Logic</h4>
          </div>
          <p className="font-body-md text-on-surface-variant line-clamp-2">Configure weights and passing thresholds for each category easily.</p>
        </div>

        <div 
          onClick={() => setShowPreviewModal(true)}
          className="bg-surface-container-low border border-outline-variant rounded-lg p-md cursor-pointer hover:border-primary hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-sm mb-xs">
            <div className="w-8 h-8 rounded-lg bg-tertiary-container text-on-tertiary-container flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px]">visibility</span>
            </div>
            <h4 className="font-label-md font-bold text-on-surface">Live Preview</h4>
          </div>
          <p className="font-body-md text-on-surface-variant line-clamp-2">See how your assessment looks to candidates as you build it.</p>
        </div>
      </div>

      {/* Builder Hierarchy Section */}
      {categories.length === 0 ? (
        <div className="py-xl bg-surface-container-low border border-dashed border-outline-variant rounded-xl mb-xl">
          <EmptyState
            icon="category"
            title="No categories yet"
            subtitle="Categories help you organize questions into logical blocks like 'Hard Skills' or 'Soft Skills'."
            actionText="Add New Category"
            actionIcon="add"
            onAction={addCategory}
          />
        </div>
      ) : (
        <>
          <div className="space-y-lg mb-xl">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEndCategory}>
              <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                {categories.map((cat, cIdx) => (
                  <SortableCategory key={cat.id} cat={cat} cIdx={cIdx}
                    updateCategory={updateCategory} removeCategory={() => confirmDelete('category', { cIdx })}
                    addFactor={addFactor} updateFactor={updateFactor} removeFactor={(cIdx, fIdx) => confirmDelete('factor', { cIdx, fIdx })}
                    addQuestion={addQuestion} updateQuestion={updateQuestion} removeQuestion={(cIdx, fIdx, qIdx) => confirmDelete('question', { cIdx, fIdx, qIdx })}
                    onDragEndFactor={onDragEndFactor} onDragEndQuestion={onDragEndQuestion}
                    openSettings={(cIdx, fIdx, qIdx) => setSettingsQuestion({ cIdx, fIdx, qIdx })}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
          
          {/* Add New Category Section */}
          <div className="mt-xl py-lg border-t border-outline-variant border-dashed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div 
                onClick={addCategory}
                className="flex flex-col gap-md p-xl bg-surface-container-low rounded-xl border border-outline-variant justify-center items-center text-center group cursor-pointer hover:bg-surface-container-high transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center text-primary mb-sm border border-outline-variant shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">category</span>
                </div>
                <h3 className="font-headline-md text-on-surface">Ready for more?</h3>
                <p className="text-on-surface-variant text-sm mb-md">Expand your assessment by adding new thematic blocks or specialized categories.</p>
                <span className="bg-secondary text-on-secondary px-xl py-sm rounded-full font-label-md flex items-center gap-sm hover:bg-primary transition-all pointer-events-none">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add New Category
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Load Category Drawer */}
      <Drawer
        open={showLoadDrawer}
        onClose={() => setShowLoadDrawer(false)}
        title="Browse Library"
        subtitle="Import reusable categories from past assessments"
        footer={
          <Button variant="secondary" onClick={() => setShowLoadDrawer(false)}>Close</Button>
        }
      >
        <div className="space-y-md">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary outline-none transition-all"
              value={categorySearch}
              onChange={e => setCategorySearch(e.target.value)}
            />
          </div>

          {loadingCategories ? (
            <div className="flex justify-center py-10">
              <span className="material-symbols-outlined text-[32px] text-on-surface-variant animate-spin">progress_activity</span>
            </div>
          ) : filteredAvailableCategories.length === 0 ? (
            <p className="text-outline text-center py-10">No categories found.</p>
          ) : (
            <div className="space-y-sm">
              {filteredAvailableCategories.map(cat => (
                <div key={cat._id} className="flex items-center justify-between p-md bg-surface-container-low border border-outline-variant rounded-lg hover:border-primary transition-all group">
                  <div>
                    <p className="font-label-md text-on-surface font-bold">{cat.name}</p>
                    <p className="text-[12px] text-outline">{cat.factors.length} factors</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="add"
                    onClick={() => handleLoadCategory(cat)}
                  >
                    Import
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, type: null, indices: null })}
        icon="warning"
        iconBg="bg-error-container"
        iconColor="text-on-error-container"
        title="Confirm Deletion"
        subtitle={`Are you sure you want to delete this ${deleteDialog.type}? This cannot be undone.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteDialog({ open: false, type: null, indices: null })}>Cancel</Button>
            <Button variant="destructive" onClick={executeDelete} icon="delete">Delete</Button>
          </>
        }
      />

      {/* Scoring Logic Modal */}
      <Modal
        open={showScoringModal}
        onClose={() => setShowScoringModal(false)}
        icon="bar_chart"
        title="Scoring Logic"
        subtitle="Configure the passing threshold for this assessment."
        footer={
          <Button variant="primary" onClick={() => setShowScoringModal(false)}>Done</Button>
        }
      >
        <div className="space-y-md">
          <label className="flex flex-col gap-xs">
            <span className="font-label-md text-on-surface font-bold">Overall Passing Threshold (%)</span>
            <input 
              type="number" 
              min="0" 
              max="100" 
              value={passingThreshold}
              onChange={(e) => setPassingThreshold(Number(e.target.value))}
              className="bg-surface border border-outline-variant rounded-lg p-sm outline-none focus:border-primary"
            />
          </label>
          <p className="text-body-sm text-on-surface-variant">
            Note: Advanced per-category weighting will be available in a future update.
          </p>
        </div>
      </Modal>

      {/* Live Preview Modal */}
      <Modal
        open={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        icon="visibility"
        title="Live Preview"
        subtitle="This is how candidates will see the assessment."
        footer={
          <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>Close Preview</Button>
        }
      >
        <div className="space-y-md bg-surface-container-lowest border border-outline-variant rounded-xl p-xl max-h-[60vh] overflow-y-auto">
          {categories.length === 0 ? (
            <p className="text-outline italic text-center py-10">Add categories to preview them here.</p>
          ) : (
            categories.map(cat => (
              <div key={cat.id} className="mb-lg">
                <h3 className="font-headline-sm font-bold text-on-surface mb-md">{cat.name}</h3>
                {cat.factors.map(fac => (
                  <div key={fac.id} className="mb-md ml-md border-l-2 border-outline-variant pl-md">
                    <h4 className="font-label-lg font-bold text-on-surface-variant mb-sm">{fac.name}</h4>
                    {fac.questions.map(q => (
                      <div key={q.id} className="mb-sm">
                        <p className="font-body-md text-on-surface">{q.text}</p>
                        {q.type === 'Text' && <input disabled className="w-full mt-1 border-b border-outline-variant bg-transparent py-1" placeholder="Text answer..." />}
                        {q.type === 'MCQ' && (
                          <div className="flex flex-col gap-1 mt-2">
                            {q.options?.map((opt, i) => (
                              <label key={i} className="flex items-center gap-sm opacity-60">
                                <input type="radio" disabled />
                                <span className="font-body-sm">{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {q.type === 'Rating' && (
                          <div className="flex gap-2 mt-2 opacity-60">
                            {[1,2,3,4,5].map(v => <div key={v} className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-xs">{v}</div>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Question Settings Modal */}
      {settingsQuestion && (() => {
        const { cIdx, fIdx, qIdx } = settingsQuestion;
        const question = categories[cIdx].factors[fIdx].questions[qIdx];
        return (
          <Modal
            open={!!settingsQuestion}
            onClose={() => setSettingsQuestion(null)}
            icon="settings"
            title="Question Settings"
            subtitle="Configure correct answer, points, and media."
            footer={
              <Button variant="primary" onClick={() => setSettingsQuestion(null)}>Done</Button>
            }
          >
            <div className="space-y-lg">
              {/* Scoring Config */}
              <div className="space-y-sm">
                <h4 className="font-label-md text-on-surface font-bold">Scoring</h4>
                <div className="grid grid-cols-2 gap-md">
                  <label className="flex flex-col gap-xs">
                    <span className="font-label-sm text-on-surface-variant">Points</span>
                    <input 
                      type="number" 
                      min="0"
                      value={question.points || 1}
                      onChange={(e) => updateQuestion(cIdx, fIdx, qIdx, 'points', Number(e.target.value))}
                      className="bg-surface border border-outline-variant rounded-lg p-sm outline-none focus:border-primary"
                    />
                  </label>
                  {question.type === 'MCQ' && (
                    <label className="flex flex-col gap-xs">
                      <span className="font-label-sm text-on-surface-variant">Correct Answer</span>
                      <div className="relative">
                        <select 
                          value={question.correctAnswer || ''}
                          onChange={(e) => updateQuestion(cIdx, fIdx, qIdx, 'correctAnswer', e.target.value)}
                          className="appearance-none w-full bg-surface border border-outline-variant rounded-lg p-sm pr-8 outline-none focus:border-primary"
                        >
                          <option value="">(None)</option>
                          {question.options?.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">
                          expand_more
                        </span>
                      </div>
                    </label>
                  )}
                  {question.type !== 'MCQ' && (
                    <label className="flex flex-col gap-xs">
                      <span className="font-label-sm text-on-surface-variant">Correct Answer</span>
                      <input 
                        type={question.type === 'Number' ? 'number' : 'text'}
                        value={question.correctAnswer || ''}
                        onChange={(e) => updateQuestion(cIdx, fIdx, qIdx, 'correctAnswer', e.target.value)}
                        className="bg-surface border border-outline-variant rounded-lg p-sm outline-none focus:border-primary"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-sm border-t border-outline-variant pt-lg">
                <h4 className="font-label-md text-on-surface font-bold">Image (optional)</h4>
                
                {question.images && question.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-md">
                    {question.images.map((img, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border border-outline-variant bg-surface-container">
                        <img src={img.url} alt={img.alt} className="w-full h-32 object-contain" />
                        <button 
                          onClick={() => handleRemoveImage(i)}
                          className="absolute top-2 right-2 bg-error text-on-error p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    ))}
                    {question.images.length < 3 && (
                      <label className="relative border-2 border-dashed border-outline-variant rounded-lg flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-surface-container transition-colors">
                        {uploadingImage ? (
                          <span className="material-symbols-outlined animate-spin text-outline">progress_activity</span>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-outline mb-1">add_photo_alternate</span>
                            <span className="text-xs text-outline font-label-sm">Add another</span>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                      </label>
                    )}
                  </div>
                ) : (
                  <label className="relative border-2 border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container transition-colors">
                    {uploadingImage ? (
                      <span className="material-symbols-outlined animate-spin text-outline text-[32px]">progress_activity</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-outline text-[32px] mb-2">cloud_upload</span>
                        <p className="font-label-md text-on-surface-variant">Click or drag image to upload</p>
                        <p className="text-xs text-outline mt-1">PNG, JPG, WEBP up to 5MB</p>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                )}
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
};

export default Builder;
