// pages/AdminPanel.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';
import { Users, Clock, HardDrive, Plus, RefreshCw, Trash2, Crown, X, LogOut, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Room {
  id: string;
  room_code: string;
  title: string;
  host_name: string;
  user_count: number;
  max_users: number;
  file_count: number;
  max_files: number;
  created_at: string;
  expires_at: string | null;
  is_vip: boolean;
}

interface Stats {
  todayRooms: number;
  activeRooms: number;
  totalStorage: string;
  totalUsers: number;
}

export default function AdminPanel() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<Stats>({ todayRooms: 0, activeRooms: 0, totalStorage: '0MB', totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    host_name: '',
    max_users: 10,
    max_files: 5,
    expiry_days: 7,
    never_expires: false
  });

  useEffect(() => {
    if (localStorage.getItem('admin_logged_in') !== 'true') {
      navigate('/admin-login');
    }
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
  
    try {
      // Fetch rooms with counts (no profiles join)
      const { data: roomsData, error: roomsError } = await supabase
        .from('parties')
        .select(`
          id,
          room_code,
          title,
          created_at,
          expires_at,
          is_vip,
          max_users,
          max_files,
          host_id,
          party_participants(count),
          party_files(count)
        `)
        .order('created_at', { ascending: false });
  
      if (roomsError) throw roomsError;
  
      const formattedRooms: Room[] = roomsData?.map((room: any) => ({
        id: room.id,
        room_code: room.room_code,
        title: room.title || 'Untitled Room',
        host_name: room.host_id || 'Unknown', // Use host_id directly
        user_count: room.party_participants[0]?.count || 0,
        max_users: room.max_users || (room.is_vip ? 20 : 5),
        file_count: room.party_files[0]?.count || 0,
        max_files: room.max_files || (room.is_vip ? 10 : 3),
        created_at: room.created_at,
        expires_at: room.expires_at,
        is_vip: !!room.is_vip
      })) || [];
  
      // Stats calculations
      const today = new Date().toDateString();
      const todayRooms = formattedRooms.filter(r => new Date(r.created_at).toDateString() === today).length;
  
      // Total unique users
      const { count: totalUsers } = await supabase
        .from('party_participants')
        .select('*', { count: 'exact', head: true });
  
      // Storage used
      let totalStorage = '0MB';
      try {
        const { data: files } = await supabase.storage.from('party-files').list('', { limit: 10000 });
        const size = files?.reduce((acc, f) => acc + (f.metadata?.size || 0), 0) || 0;
        totalStorage = (size / 1024 / 1024).toFixed(1) + 'MB';
      } catch (e) {
        console.log('Storage check failed:', e);
      }
  
      setRooms(formattedRooms);
      setStats({
        todayRooms,
        activeRooms: formattedRooms.length,
        totalStorage,
        totalUsers: totalUsers || 0
      });
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    localStorage.removeItem('admin_logged_in');
    navigate('/admin-login');
  };

  const createVIPRoom = async () => {
    const hostInput = prompt("Enter host username or email:");
    if (!hostInput?.trim()) return;
  
    const maxUsers = Number(prompt("Max users? (e.g. 20)", "20") || 20);
    const maxFiles = Number(prompt("Max files? (e.g. 10)", "10") || 10);
    const expiryInput = prompt("Expiry in minutes? (leave empty = never)", "30");
  
    const expiresInMinutes = expiryInput === "" ? null : Number(expiryInput) || 30;
  
    // Find user ID from PROFILES table (not auth.users)
    let userId = null;
    const { data: userData, error: lookupError } = await supabase
      .from('profiles')
      .select('id, username, email')
      .or(`username.eq.${hostInput},email.eq.${hostInput}`)
      .single();
  
    if (userData) {
      userId = userData.id;
    } else if (lookupError) {
      console.error('User lookup error:', lookupError);
      alert("User not found! Using admin as host.");
    }
  
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const roomId = crypto.randomUUID();
  
    const expiresAt = expiresInMinutes === null 
      ? null 
      : new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();
  
    const { error: insertError } = await supabase
      .from('parties')
      .insert({
        id: roomId,
        room_code: code,
        title: `${hostInput}'s VIP Room`,
        host_id: userId || '00000000-0000-0000-0000-000000000000', // fallback admin
        activity_type: 'movie',
        is_live: true,
        is_vip: true,
        expires_at: expiresAt,
        max_users: maxUsers,
        max_files: maxFiles
      });
  
    if (insertError) {
      alert("Error: " + insertError.message);
    } else {
      fetchData(); // refresh list
      const link = `https://watchparty.com/join/${code}`;
      navigator.clipboard.writeText(`VIP Room Ready!\nHost: ${hostInput}\nCode: ${code}\nLink: ${link}\nExpires: ${expiresInMinutes ? expiresInMinutes + ' min' : 'Never'}`);
      alert(`VIP ROOM CREATED!\nCode: ${code}\nCopied to clipboard!`);
    }
  };
  
  const deleteRoom = async (id: string) => {
    if (!confirm('Delete this room?')) return;
    await supabase.from('parties').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            WATCHPARTY ADMIN PANEL - GOD MODE
          </h1>
          <button onClick={logout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-3xl font-bold text-green-400">{stats.todayRooms}</div>
            <div className="text-gray-400">Rooms Today</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-3xl font-bold text-blue-400">{stats.activeRooms}</div>
            <div className="text-gray-400">Active Rooms</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-3xl font-bold text-purple-400">{stats.totalStorage}</div>
            <div className="text-gray-400">Storage Used</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-3xl font-bold text-yellow-400">{stats.totalUsers}</div>
            <div className="text-gray-400">Total Users</div>
          </div>
        </div>

        {/* Live Rooms */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-8">
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl font-bold">LIVE ROOMS</h2>
            <div className="flex gap-3">
              <button onClick={fetchData} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              <button
                onClick={createVIPRoom}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 shadow-lg"
              >
                <Plus className="w-6 h-6" /> CREATE VIP ROOM
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="text-left p-4">Code</th>
                  <th className="text-left p-4">Host</th>
                  <th className="text-left p-4">Users</th>
                  <th className="text-left p-4">Files</th>
                  <th className="text-left p-4">Expires</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center p-12 text-gray-500">Loading rooms...</td></tr>
                ) : rooms.length === 0 ? (
                  <tr><td colSpan={6} className="text-center p-12 text-gray-500">No active rooms</td></tr>
                ) : (
                  rooms.map(room => (
                    <tr key={room.id} className="border-t border-gray-700 hover:bg-gray-750 transition">
                      <td className="p-4 font-mono text-green-400">{room.room_code}</td>
                      <td className="p-4">{room.host_name}</td>
                      <td className="p-4">
                        <span className={room.user_count >= room.max_users ? 'text-red-400 font-bold' : 'text-green-400'}>
                          {room.user_count}/{room.max_users}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={room.file_count >= room.max_files ? 'text-red-400 font-bold' : 'text-green-400'}>
                          {room.file_count}/{room.max_files}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        {room.expires_at ? formatDistanceToNow(new Date(room.expires_at), { addSuffix: true }) : 'Never'}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 flex-wrap">
                          <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">Extend</button>
                          <button onClick={() => deleteRoom(room.id)} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm flex items-center gap-1">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                          {room.is_vip && <span className="bg-yellow-600 text-black px-3 py-1 rounded font-bold text-sm flex items-center gap-1">
                            <Crown className="w-4 h-4" /> VIP
                          </span>}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CREATE VIP ROOM MODAL */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Create VIP Room</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Host username/email"
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={form.host_name}
                  onChange={(e) => setForm({...form, host_name: e.target.value})}
                />
                <input
                  type="number"
                  placeholder="Max users"
                  className="w-full bg-gray-700 rounded-lg px-4 py-3"
                  value={form.max_users}
                  onChange={(e) => setForm({...form, max_users: Number(e.target.value)})}
                />
                <input
                  type="number"
                  placeholder="Max files"
                  className="w-full bg-gray-700 rounded-lg px-4 py-3"
                  value={form.max_files}
                  onChange={(e) => setForm({...form, max_files: Number(e.target.value)})}
                />
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="never"
                    checked={form.never_expires}
                    onChange={(e) => setForm({...form, never_expires: e.target.checked})}
                  />
                  <label htmlFor="never" className="text-lg">Never Expires</label>
                </div>
                {!form.never_expires && (
                  <input
                    type="number"
                    placeholder="Days until expiry"
                    className="w-full bg-gray-700 rounded-lg px-4 py-3"
                    value={form.expiry_days}
                    onChange={(e) => setForm({...form, expiry_days: Number(e.target.value)})}
                  />
                )}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={createVIPRoom}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-bold"
                >
                  CREATE & COPY LINK
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-12 text-gray-500 text-sm">
          SERVER STATUS: ONLINE • Free Tier: {stats.totalStorage} / 1GB • Auto-clean every 1 min
        </div>
      </div>
    </div>
  );
}