import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock data for charts
const taskStatusData = [
  { name: 'To Do', value: 10 },
  { name: 'In Progress', value: 5 },
  { name: 'In Review', value: 3 },
  { name: 'Done', value: 12 },
];

const taskCompletionData = [
  { name: 'Mon', completed: 2, total: 5 },
  { name: 'Tue', completed: 4, total: 6 },
  { name: 'Wed', completed: 3, total: 4 },
  { name: 'Thu', completed: 5, total: 7 },
  { name: 'Fri', completed: 6, total: 8 },
  { name: 'Sat', completed: 1, total: 2 },
  { name: 'Sun', completed: 0, total: 1 },
];

const teamPerformanceData = [
  { name: 'Team A', tasks: 25, completed: 18 },
  { name: 'Team B', tasks: 15, completed: 10 },
  { name: 'Team C', tasks: 20, completed: 15 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface DynamicChartsProps {
  reportType: string;
}

export default function DynamicCharts({ reportType }: DynamicChartsProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {reportType === 'task_status' ? (
        <PieChart>
          <Pie
            data={taskStatusData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {taskStatusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      ) : reportType === 'task_completion' ? (
        <BarChart
          data={taskCompletionData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="completed" fill="#0ea5e9" name="Completed Tasks" />
          <Bar dataKey="total" fill="#94a3b8" name="Total Tasks" />
        </BarChart>
      ) : (
        <BarChart
          data={teamPerformanceData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="tasks" fill="#94a3b8" name="Total Tasks" />
          <Bar dataKey="completed" fill="#0ea5e9" name="Completed Tasks" />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}