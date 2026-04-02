import React, { useEffect, useState } from 'react';

const DeptHeadTaskPage = () => {
  const [myTasks, setMyTasks] = useState([]);
  const [teamTasks, setTeamTasks] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/tasks', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();

        // 1. Tasks assigned specifically to the Dept Head (e.g., Kaphle)
        const personal = data.filter((t: any) => String(t.assigned_to) === String(user.id));
        
        // 2. Tasks assigned to the department (Dept 96) but NOT to the head personally
        const team = data.filter((t: any) => 
          String(t.department_id) === String(user.department_id) && 
          String(t.assigned_to) !== String(user.id)
        );

        setMyTasks(personal);
        setTeamTasks(team);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      }
    };
    fetchTasks();
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Task Management</h1>

      {/* SECTION 1: MY PERSONAL TASKS */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-cyan-400">Tasks Assigned to Me</h2>
        <div className="grid gap-4">
          {myTasks.length > 0 ? myTasks.map((task: any) => (
            <div key={task.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex justify-between">
                <h3 className="font-bold text-lg">{task.title}</h3>
                <span className="px-2 py-1 bg-yellow-600 rounded text-xs">{task.status}</span>
              </div>
              <p className="text-gray-400 mt-2">{task.description}</p>
              <div className="mt-4 flex gap-2">
                <button className="bg-cyan-600 px-3 py-1 rounded text-sm">Update Progress</button>
                <button className="bg-green-600 px-3 py-1 rounded text-sm">Mark Complete</button>
              </div>
            </div>
          )) : <p className="text-gray-500 italic">No personal tasks assigned by Admin.</p>}
        </div>
      </section>

      {/* SECTION 2: TEAM TASKS */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-purple-400">Team Progress (Dept {user.department_id})</h2>
        <div className="grid gap-4 opacity-80">
          {teamTasks.map((task: any) => (
            <div key={task.id} className="bg-gray-900 p-4 rounded-lg border border-dashed border-gray-600">
              <h3 className="font-bold">{task.title}</h3>
              <p className="text-sm text-gray-400">Assigned to: {task.assignee_name || 'Team Member'}</p>
              <div className="w-full bg-gray-700 h-2 mt-2 rounded">
                <div className="bg-cyan-500 h-2 rounded" style={{ width: `${task.progress || 0}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DeptHeadTaskPage;