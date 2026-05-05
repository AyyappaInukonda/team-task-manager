import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FolderKanban, CheckSquare, Clock, AlertTriangle,
  TrendingUp, ListTodo, Eye, ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';

const statusBadge = {
  TODO: 'badge-todo',
  IN_PROGRESS: 'badge-in-progress',
  REVIEW: 'badge-review',
  DONE: 'badge-done',
};

const priorityBadge = {
  LOW: 'badge-low',
  MEDIUM: 'badge-medium',
  HIGH: 'badge-high',
  CRITICAL: 'badge-critical',
};

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    dashboardApi.getStats()
      .then(res => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FolderKanban} label="Total Projects" value={stats?.totalProjects ?? 0}
          color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={CheckSquare} label="Total Tasks" value={stats?.totalTasks ?? 0}
          color="text-green-600" bg="bg-green-50" />
        <StatCard icon={TrendingUp} label="In Progress" value={stats?.tasksInProgress ?? 0}
          color="text-yellow-600" bg="bg-yellow-50" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats?.overdueTasks ?? 0}
          color="text-red-600" bg="bg-red-50" />
      </div>

      {/* Task status breakdown */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Task Status Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'To Do', value: stats?.tasksTodo ?? 0, cls: 'bg-gray-100 text-gray-700' },
            { label: 'In Progress', value: stats?.tasksInProgress ?? 0, cls: 'bg-blue-100 text-blue-700' },
            { label: 'In Review', value: stats?.tasksReview ?? 0, cls: 'bg-yellow-100 text-yellow-700' },
            { label: 'Done', value: stats?.tasksDone ?? 0, cls: 'bg-green-100 text-green-700' },
          ].map(({ label, value, cls }) => (
            <div key={label} className={`${cls} rounded-xl p-4 text-center`}>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Tasks</h2>
            <Link to="/my-tasks" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {stats?.recentTasks?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No tasks yet</p>
          ) : (
            <div className="space-y-3">
              {stats?.recentTasks?.map(task => (
                <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{task.projectName}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <span className={statusBadge[task.status]}>
                      {task.status.replace('_', ' ')}
                    </span>
                    {task.overdue && <span className="badge-critical">Overdue</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Projects */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Projects</h2>
            <Link to="/projects" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {stats?.recentProjects?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No projects yet</p>
          ) : (
            <div className="space-y-3">
              {stats?.recentProjects?.map(project => (
                <Link key={project.id} to={`/projects/${project.id}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FolderKanban className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{project.name}</p>
                    <p className="text-xs text-gray-500">{project.totalTasks} tasks · {project.members?.length} members</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    project.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{project.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
