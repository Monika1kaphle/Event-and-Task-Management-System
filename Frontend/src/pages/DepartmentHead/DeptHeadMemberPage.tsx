import { useState, useEffect } from 'react';
import { Loader2, UserPlus, Mail, Shield, Trash2, X } from 'lucide-react';
import { Sidebar } from '../../components/layout/Sidebar';



interface DeptHeadMemberPageProps {
  onLogout: () => void
}

export function DeptHeadMemberPage({ onLogout }: DeptHeadMemberPageProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    roleTitle: ''
  });

  const token = localStorage.getItem('token');
  const headers = { 
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}` 
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/users/members/department', { headers });
      if (response.ok) {
        const members = await response.json();
        
        // Ensure 'name' is populated even if the DB column is 'full_name'
        const sanitizedMembers = members.map((m: any) => ({
          ...m,
          name: m.name || m.full_name || 'Unknown'
        }));

        setMembers(sanitizedMembers);
      } else if (response.status === 401) {
        onLogout();
      }
    } catch (err) {
      console.error("Failed to fetch department members", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:3000/api/users/invite-member', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Invitation sent successfully!');
        setShowModal(false);
        setFormData({ fullName: '', email: '', roleTitle: '' });
        fetchMembers(); // Refresh list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to send invitation');
      }
    } catch (err) {
      alert('Error connecting to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1419] text-white flex overflow-hidden">
      {/* Sidebar - Fixed Width */}
      <div className="w-64 fixed inset-y-0 left-0 z-50">
        <Sidebar onLogout={onLogout} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Manage Members</h1>
            <p className="text-gray-400">View and manage staff in your department</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#4fd1c5] text-[#0f1419] font-bold rounded-xl hover:bg-[#3dbbb0] transition-all shadow-lg shadow-[#4fd1c5]/10"
          >
            <UserPlus size={18} />
            Invite Member
          </button>
        </div>

      {loading ? (
        <div className="flex justify-center h-64 items-center">
          <Loader2 className="animate-spin text-[#4fd1c5]" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div key={member.id} className="bg-[#161b22] border border-gray-800 rounded-xl p-6 hover:border-[#4fd1c5]/30 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2d5f5d] to-[#1a3a38] flex items-center justify-center font-bold text-[#4fd1c5] shadow-inner">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold group-hover:text-[#4fd1c5] transition-colors">{member.name}</h3>
                  <p className="text-xs text-[#4fd1c5] font-medium uppercase tracking-wider">{member.role_title || 'Staff Member'}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Mail size={14} /> {member.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Shield size={14} /> Status: 
                  <span className={`ml-1 ${member.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {member.status}
                  </span>
                </div>
              </div>

              <button className="w-full py-2 bg-red-500/5 text-red-500/70 border border-red-500/10 rounded-lg hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 text-sm font-medium">
                <Trash2 size={14} /> Remove Member
              </button>
            </div>
          ))}
          
          {members.length === 0 && (
            <div className="col-span-full text-center py-20 bg-[#161b22]/50 border-2 border-dashed border-gray-800 rounded-2xl">
              <p className="text-gray-500 text-lg">No members found. Start by inviting your team!</p>
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-gray-800 rounded-2xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Invite New Member</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                <input 
                  required
                  type="text"
                  className="w-full bg-[#0f1419] border border-gray-800 rounded-xl px-4 py-3 focus:border-[#4fd1c5] focus:ring-1 focus:ring-[#4fd1c5] outline-none transition-all"
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                <input 
                  required
                  type="email"
                  className="w-full bg-[#0f1419] border border-gray-800 rounded-xl px-4 py-3 focus:border-[#4fd1c5] focus:ring-1 focus:ring-[#4fd1c5] outline-none transition-all"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Role Title (Optional)</label>
                <input 
                  type="text"
                  className="w-full bg-[#0f1419] border border-gray-800 rounded-xl px-4 py-3 focus:border-[#4fd1c5] focus:ring-1 focus:ring-[#4fd1c5] outline-none transition-all"
                  placeholder="e.g. Senior Designer"
                  value={formData.roleTitle}
                  onChange={e => setFormData({...formData, roleTitle: e.target.value})}
                />
              </div>

              <button 
                disabled={isSubmitting}
                type="submit"
                className="w-full py-3 bg-[#4fd1c5] text-[#0f1419] font-bold rounded-xl hover:bg-[#3dbbb0] transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Send Invitation'}
              </button>
            </form>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}