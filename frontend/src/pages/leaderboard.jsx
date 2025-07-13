import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Leaf, Recycle, Shield, Sparkles } from 'lucide-react';
import { getLeaderboard } from '../apis/user';

const AVATAR_EMOJIS = ['🏆', '🥈', '🥉'];
const PARTICLE_EMOJIS = ['🌱', '♻️', '🌿', '🍃', '🌳'];

const FloatingElements = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {[...Array(14)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        initial={{ 
          x: Math.random() * window.innerWidth, 
          y: window.innerHeight + 50,
          rotate: 0 
        }}
        animate={{ 
          y: -100, 
          rotate: 360,
          opacity: [0, 0.6, 0] 
        }}
        transition={{
          duration: Math.random() * 8 + 12,
          repeat: Infinity,
          ease: "linear",
          delay: Math.random() * 5
        }}
        style={{
          fontSize: Math.random() * 8 + 16,
        }}
      >
        {PARTICLE_EMOJIS[Math.floor(Math.random() * PARTICLE_EMOJIS.length)]}
      </motion.div>
    ))}
  </div>
);

const ChampionPodium = ({ user, position, delay }) => {
  // Larger for 1st, medium for 2nd/3rd
  const sizes = [96, 72, 72]; // px
  const trophyColors = [
    'text-yellow-400', 'text-gray-300', 'text-orange-400'
  ];
  const avatars = AVATAR_EMOJIS;
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.8, type: "spring", stiffness: 100 }}
      className="flex flex-col items-center relative"
      style={{ minWidth: sizes[position] }}
    >
      {position === 0 && (
        <motion.div
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -top-6 text-3xl z-20"
        >
          👑
        </motion.div>
      )}
      <motion.div
        className={`relative rounded-full bg-gradient-to-br from-green-300 via-green-200 to-emerald-100 flex items-center justify-center font-bold shadow-lg mb-3`}
        style={{ width: sizes[position], height: sizes[position], fontSize: sizes[position] / 2.2 }}
        whileHover={{ scale: 1.1 }}
        animate={{ boxShadow: ['0 0 20px #22c55e33', '0 0 40px #22c55e66', '0 0 20px #22c55e33'] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span>{avatars[position]}</span>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-base font-bold text-white">{position + 1}</span>
        </div>
      </motion.div>
      <motion.h3 
        className="text-base font-bold text-green-900 mb-1 max-w-24 truncate"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.3 }}
      >
        {user?.username || `User ${position + 1}`}
      </motion.h3>
      <motion.div 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.4 }}
      >
        <div className="flex items-center gap-1 mb-1">
          <Leaf className="w-4 h-4 text-green-600" />
          <span className="text-sm font-bold text-green-700">
            {user?.greenCoins?.toLocaleString() || '0'}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

const LeaderboardRow = ({ user, index, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5, type: "spring" }}
    whileHover={{ scale: 1.02, x: 5 }}
    className="rounded-xl p-3 mb-2 bg-white/80 hover:bg-green-50 border border-green-200 flex items-center justify-between shadow-sm transition-all duration-300"
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-green-700 border border-green-200">
        #{index + 4}
      </div>
      <div>
        <div className="text-sm font-medium text-green-900">{user.username}</div>
      </div>
    </div>
    <div className="text-right">
      <div className="flex items-center gap-1">
        <Leaf className="w-4 h-4 text-green-600" />
        <span className="text-sm font-bold text-green-700">{user.greenCoins?.toLocaleString()}</span>
      </div>
    </div>
  </motion.div>
);

const StatsCard = ({ icon: Icon, value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    className="rounded-xl p-4 text-center bg-gradient-to-br from-green-100 to-emerald-50 border border-green-200 shadow hover:shadow-lg transition-all duration-300"
  >
    <motion.div
      animate={{ rotate: [0, 5, -5, 0] }}
      transition={{ duration: 3, repeat: Infinity, delay: delay }}
    >
      <Icon className="w-6 h-6 text-green-600 mx-auto mb-2" />
    </motion.div>
    <div className="text-lg font-bold text-green-700">{value}</div>
    <div className="text-xs text-green-800">{label}</div>
  </motion.div>
);

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLeaderboard();
        setUsers(data);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalCoins = users.reduce((sum, user) => sum + (user.greenCoins || 0), 0);
  const totalCarbon = users.reduce((sum, user) => sum + (user.carbonFootprintSaved || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 via-green-100 to-emerald-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-200 via-green-100 to-emerald-100">
      <FloatingElements />
      <div className="relative z-10 container mx-auto px-6 py-8 max-w-7xl">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <div className="rounded-2xl px-6 py-4 bg-gradient-to-r from-green-300/60 to-emerald-100/80 shadow-lg">
              <h1 className="text-4xl font-black text-green-900 mb-2 flex items-center justify-center gap-3">
                <Shield className="w-8 h-8 text-green-600" />
                Green Rescue Champions
                <Sparkles className="w-8 h-8 text-green-600" />
              </h1>
              <p className="text-green-800">Heroes who saved products from waste</p>
            </div>
          </motion.div>
        </motion.div>
        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-6 mb-6">
          {/* Champion Podium - Left Section */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="rounded-2xl p-6 h-full flex flex-col justify-between bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow"
              style={{ minHeight: '100%', height: '100%' }}
            >
              <div>
                <h2 className="text-xl font-bold text-green-900 mb-6 text-center flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5 text-green-600" />
                  Top Champions
                </h2>
                {/* In the podium arrangement, use a flex with 2nd, 1st, 3rd in a podium layout */}
                <div className="flex justify-center items-end gap-6 mb-4 w-full" style={{ minHeight: 140, marginTop: '2.5rem' }}>
                  {/* 2nd place - left */}
                  {users[1] && (
                    <div className="flex-1 flex justify-end">
                      <ChampionPodium user={users[1]} position={1} delay={0.5} />
                    </div>
                  )}
                  {/* 1st place - center */}
                  <div className="flex-1 flex justify-center">
                    {users[0] && <ChampionPodium user={users[0]} position={0} delay={0.3} />}
                  </div>
                  {/* 3rd place - right */}
                  {users[2] && (
                    <div className="flex-1 flex justify-start">
                      <ChampionPodium user={users[2]} position={2} delay={0.7} />
                    </div>
                  )}
                </div>
              </div>
              {/* Prize section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-center bg-gradient-to-r from-green-200/40 to-emerald-100/40 rounded-xl p-4 border border-green-200/40 mt-8"
              >
                <div className="text-green-700 font-bold text-lg mb-1">₹1,00,000</div>
                <div className="text-xs text-green-800">Monthly Prize Pool</div>
              </motion.div>
            </motion.div>
          </div>
          {/* Main Leaderboard - Right Section */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="rounded-2xl p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-green-900 flex items-center gap-2">
                  <Recycle className="w-5 h-5 text-green-600" />
                  Full Rankings
                </h2>
                <div className="text-sm text-green-700">
                  {users.length} eco-heroes
                </div>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2 scroll-smooth">
                {users.slice(3).map((user, index) => (
                  <LeaderboardRow 
                    key={user._id}
                    user={user} 
                    index={index} 
                    delay={0.6 + index * 0.1}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
        {/* Stats and CTA Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard 
            icon={Shield} 
            value={users.length} 
            label="Heroes" 
            delay={0.8}
          />
          <StatsCard 
            icon={Leaf} 
            value={totalCoins.toLocaleString()} 
            label="Green Coins" 
            delay={0.9}
          />
          <StatsCard 
            icon={Recycle} 
            value={totalCarbon.toLocaleString()} 
            label="Total CO₂ Saved (kg)" 
            delay={1.0}
          />
          {/* Removed Items Saved Stat Card */}
          <StatsCard 
            icon={Sparkles} 
            value="Live" 
            label="Competition" 
            delay={1.1}
          />
        </div>
        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-center"
        >
          <div className="rounded-2xl p-6 max-w-2xl mx-auto bg-gradient-to-r from-green-200/60 to-emerald-100/80 shadow-lg">
            <h3 className="text-2xl font-bold text-green-900 mb-3">Join the Green Rescue Mission!</h3>
            <p className="text-green-800 mb-4">
              Every cancelled order you rescue saves the planet and earns you rewards
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Rescuing 🌱
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;
