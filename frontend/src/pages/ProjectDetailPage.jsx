import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectApi, taskApi, userApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, UserPlus, Trash2, ChevronLeft, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', REVIEW: 'Review', DONE: 'Done' };
const STATUS_COLORS = {
  TODO: 'bg-gray-50 border-gray-200',
  IN_PROGRESS: 'bg-blue-50 border-blue-200',
  REVIEW: 'bg-yellow-50 border-yellow-200',
  DONE: 'bg-green-50 border-green-200',
};
const PRIORITY_COLORS = { LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high', CRITICAL: 'badge-critical' };

function TaskModal({ projectId, members, task, onClose, onSave }) {
  const [form, setForm] = useState(task || {
    title: '', description: '', status: 'TODO',
    priority: 'MEDIUM', dueDate: '', assignedToId: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, assignedToId: form.assignedToId || null, dueDate: form.dueDate || null };
      await onSave(payload);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{task ? 'Edit Task' : 'Create Task'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input className="input" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description || ''}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="input" value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select className="input" value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}>
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" className="input" value={form.dueDate || ''}
                onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select className="input" value={form.assignedToId || ''}
                onChange={e => setForm({ ...form, assignedToId: e.target.value ? Number(e.target.value) : '' })}>
                <option value="">Unassigned</option>
                {members?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Saving...' : task ? 'Update' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddMemberModal({ onClose, onAdd }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await onAdd(email);
      onClose();
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Add Member</h2>
        {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="email" className="input" placeholder="member@email.com"
            value={email} onChange={e => setEmail(e.target.value)} required />
          <div className="flex gap-3">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const load = async () => {
    const [proj, taskList] = await Promise.all([
      projectApi.getOne(id),
      taskApi.getByProject(id)
    ]);
    setProject(proj.data);
    setTasks(taskList.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleCreateTask = async (form) => {
    await taskApi.create(id, form);
    load();
  };

  const handleUpdateTask = async (form) => {
    await taskApi.update(editTask.id, form);
    setEditTask(null);
    load();
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await taskApi.delete(taskId);
    load();
  };

  const handleStatusChange = async (taskId, status) => {
    await taskApi.updateStatus(taskId, status);
    load();
  };

  const handleAddMember = async (email) => {
    await projectApi.addMember(id, { email });
    load();
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    await projectApi.removeMember(id, userId);
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  const isOwnerOrAdmin = user?.role === 'ADMIN' || project?.owner?.id === user?.id;
  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s);
    return acc;
  }, {});

  return (
    <div className="max-w-full space-y-6">
      {/* Header */}
      <div>
        <button onClick={() => navigate('/projects')}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm mb-3">
          <ChevronLeft className="w-4 h-4" /> Back to Projects
        </button>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project?.name}</h1>
            {project?.description && <p className="text-gray-500 mt-1">{project.description}</p>}
          </div>
          <div className="flex gap-2">
            {isOwnerOrAdmin && (
              <button className="btn-secondary flex items-center gap-2 text-sm"
                onClick={() => setShowMemberModal(true)}>
                <UserPlus className="w-4 h-4" /> Add Member
              </button>
            )}
            <button className="btn-primary flex items-center gap-2 text-sm"
              onClick={() => setShowTaskModal(true)}>
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-gray-500" />
          <h3 className="font-medium text-gray-900">Team Members ({project?.members?.length})</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {project?.members?.map(member => (
            <div key={member.id} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                {member.name[0].toUpperCase()}
              </div>
              <span className="text-sm text-gray-700">{member.name}</span>
              <span className="text-xs text-gray-400 capitalize">{member.role?.toLowerCase()}</span>
              {isOwnerOrAdmin && member.id !== project?.owner?.id && (
                <button onClick={() => handleRemoveMember(member.id)}
                  className="text-gray-400 hover:text-red-500 ml-1">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATUSES.map(status => (
          <div key={status} className={`rounded-xl border-2 ${STATUS_COLORS[status]} p-4`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700 text-sm">{STATUS_LABELS[status]}</h3>
              <span className="bg-white text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium border">
                {tasksByStatus[status].length}
              </span>
            </div>
            <div className="space-y-2 min-h-[120px]">
              {tasksByStatus[status].map(task => (
                <div key={task.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => { setEditTask(task); setShowTaskModal(true); }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">{task.title}</p>
                    <button className="text-gray-300 hover:text-red-500 flex-shrink-0"
                      onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className={PRIORITY_COLORS[task.priority]}>{task.priority}</span>
                    {task.overdue && <span className="badge-critical">Overdue</span>}
                  </div>

                  {task.dueDate && (
                    <div className={`flex items-center gap-1 text-xs mb-2 ${task.overdue ? 'text-red-500' : 'text-gray-400'}`}>
                      <Calendar className="w-3 h-3" />
                      {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </div>
                  )}

                  {task.assignedTo && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                        {task.assignedTo.name[0]}
                      </div>
                      <span className="text-xs text-gray-500 truncate">{task.assignedTo.name}</span>
                    </div>
                  )}

                  {/* Quick status change */}
                  <select className="mt-2 text-xs border border-gray-200 rounded px-1 py-0.5 w-full bg-white"
                    value={task.status}
                    onClick={e => e.stopPropagation()}
                    onChange={e => handleStatusChange(task.id, e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showTaskModal && (
        <TaskModal
          projectId={id}
          members={project?.members}
          task={editTask}
          onClose={() => { setShowTaskModal(false); setEditTask(null); }}
          onSave={editTask ? handleUpdateTask : handleCreateTask}
        />
      )}
      {showMemberModal && (
        <AddMemberModal onClose={() => setShowMemberModal(false)} onAdd={handleAddMember} />
      )}
    </div>
  );
}
