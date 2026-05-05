import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { taskApi } from '../services/api';
import { CheckSquare, Calendar, AlertTriangle, Filter } from 'lucide-react';
import { format } from 'date-fns';

const STATUSES = ['ALL', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
const STATUS_LABELS = { ALL: 'All', TODO: 'To Do', IN_PROGRESS: 'In Progress', REVIEW: 'Review', DONE: 'Done' };
const STATUS_BADGE = {
  TODO: 'badge-todo', IN_PROGRESS: 'badge-in-progress',
  REVIEW: 'badge-review', DONE: 'badge-done'
};
const PRIORITY_BADGE = { LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high', CRITICAL: 'badge-critical' };

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const load = () => {
    taskApi.getMyTasks()
      .then(res => setTasks(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatusChange = async (taskId, status) => {
    await taskApi.updateStatus(taskId, status);
    load();
  };

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);
  const overdue = tasks.filter(t => t.overdue);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-500 mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you</p>
      </div>

      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">{overdue.length} overdue task{overdue.length !== 1 ? 's' : ''}</p>
            <p className="text-sm text-red-600">Please review and update their status.</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(s => (
          <button key={s}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === s
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setFilter(s)}>
            {STATUS_LABELS[s]}
            {s !== 'ALL' && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                filter === s ? 'bg-blue-500' : 'bg-gray-100 text-gray-500'
              }`}>
                {tasks.filter(t => t.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => (
            <div key={task.id} className={`card flex items-start gap-4 ${task.overdue ? 'border-red-200 bg-red-50/50' : ''}`}>
              {/* Status toggle */}
              <input type="checkbox" className="mt-1 w-4 h-4 rounded accent-blue-600 cursor-pointer"
                checked={task.status === 'DONE'}
                onChange={() => handleStatusChange(task.id, task.status === 'DONE' ? 'TODO' : 'DONE')} />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h3 className={`font-medium ${task.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                  <div className="flex gap-1">
                    <span className={STATUS_BADGE[task.status]}>{STATUS_LABELS[task.status]}</span>
                    <span className={PRIORITY_BADGE[task.priority]}>{task.priority}</span>
                    {task.overdue && <span className="badge-critical">Overdue</span>}
                  </div>
                </div>

                {task.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                )}

                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                  <Link to={`/projects/${task.projectId}`} className="hover:text-blue-600 font-medium">
                    📁 {task.projectName}
                  </Link>
                  {task.dueDate && (
                    <span className={`flex items-center gap-1 ${task.overdue ? 'text-red-500 font-medium' : ''}`}>
                      <Calendar className="w-3 h-3" />
                      Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick status change */}
              <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white flex-shrink-0"
                value={task.status}
                onChange={e => handleStatusChange(task.id, e.target.value)}>
                {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
