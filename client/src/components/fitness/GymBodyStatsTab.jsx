import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiChevronDown, FiActivity, FiDroplet, FiHeart, FiCamera, FiPlus,
  FiInfo, FiTrendingUp, FiTrendingDown, FiShield, FiMoon, FiEdit2, FiCheck, FiX, FiUploadCloud
} from 'react-icons/fi';
import MuscleDiagram from './MuscleDiagram';
import ProgressPhotos from './ProgressPhotos';

export default function GymBodyStatsTab({ googleAccessToken, googleDriveFolderLink }) {
  const [bodyStats, setBodyStats] = useState({
      weight: 0,
      bodyFat: 0,
      muscleMass: 0,
      bmi: 0,
      bodyWater: 0,
      visceralFat: 0,
      measurements: {
        Neck: 0, Chest: 0, Waist: 0, Hips: 0, 'Right Arm': 0, 'Left Arm': 0, 'Right Thigh': 0, 'Left Thigh': 0
      },
      health: {
        'Resting Heart Rate': 0,
        'Blood Pressure': '0/0',
        'Sleep (Avg)': 0,
        'Stress Level (Avg)': 'Low',
        'Recovery Score (Avg)': 0
      },
      photos: {
        front: null,
        right: null,
        back: null,
        left: null
      }
  });

  const [checkpointsList, setCheckpointsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCheckpoints = async () => {
      try {
        const token = localStorage.getItem('lifeos_token');
        const res = await axios.get('/api/fitness/checkpoints', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.length > 0) {
          setCheckpointsList(res.data);
          const latest = res.data[0];
          setBodyStats({
            weight: latest.weight_kg || 0,
            bodyFat: latest.body_fat_pct || 0,
            muscleMass: latest.muscle_mass_kg || 0,
            bmi: latest.bmi || 0,
            bodyWater: latest.body_water_pct || 0,
            visceralFat: latest.visceral_fat || 0,
            measurements: {
              Neck: latest.measurements?.Neck || 0,
              Chest: latest.chest_cm || latest.measurements?.Chest || 0,
              Waist: latest.waist_cm || latest.measurements?.Waist || 0,
              Hips: latest.measurements?.Hips || 0,
              'Right Arm': latest.measurements?.['Right Arm'] || 0,
              'Left Arm': latest.arms_cm || latest.measurements?.['Left Arm'] || 0,
              'Right Thigh': latest.measurements?.['Right Thigh'] || 0,
              'Left Thigh': latest.measurements?.['Left Thigh'] || 0
            },
            health: latest.health_metrics || {
              'Resting Heart Rate': 0,
              'Blood Pressure': '0/0',
              'Sleep (Avg)': 0,
              'Stress Level (Avg)': 'Low',
              'Recovery Score (Avg)': 0
            },
            photos: {
              front: latest.photo_front_url || null,
              right: latest.photo_right_url || null,
              back: latest.photo_back_url || null,
              left: latest.photo_left_url || null
            }
          });
        }
      } catch (error) {
        console.error('Error fetching body stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCheckpoints();
  }, []);

  const saveStatsToBackend = async (statsToSave) => {
    try {
      const token = localStorage.getItem('lifeos_token');
      await axios.post('/api/fitness/checkpoint', {
        weight_kg: statsToSave.weight,
        body_fat_pct: statsToSave.bodyFat,
        muscle_mass_kg: statsToSave.muscleMass,
        bmi: statsToSave.bmi,
        body_water_pct: statsToSave.bodyWater,
        visceral_fat: statsToSave.visceralFat,
        waist_cm: statsToSave.measurements.Waist,
        chest_cm: statsToSave.measurements.Chest,
        arms_cm: statsToSave.measurements['Left Arm'], // Simplification
        measurements: statsToSave.measurements,
        health_metrics: statsToSave.health,
        photo_front_url: statsToSave.photos.front,
        photo_right_url: statsToSave.photos.right,
        photo_back_url: statsToSave.photos.back,
        photo_left_url: statsToSave.photos.left
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  };

  const [isEditingMainStats, setIsEditingMainStats] = useState(false);
  const [isEditingMeasurements, setIsEditingMeasurements] = useState(false);
  const [isEditingHealth, setIsEditingHealth] = useState(false);

  const handleMainStatChange = (key, value) => {
    setBodyStats(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleMeasurementChange = (key, value) => {
    setBodyStats(prev => ({
      ...prev,
      measurements: { ...prev.measurements, [key]: value }
    }));
  };

  const handleHealthChange = (key, value) => {
    setBodyStats(prev => ({
      ...prev,
      health: { ...prev.health, [key]: value }
    }));
  };

  if (isLoading) {
    return <div className="text-center py-20 text-text-muted">Loading Body Stats...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-text-primary">Body Status</h2>
            <button onClick={() => {
              if (isEditingMainStats) {
                saveStatsToBackend(bodyStats);
              }
              setIsEditingMainStats(!isEditingMainStats);
            }} className="text-[10px] text-purple font-bold hover:underline flex items-center gap-1 bg-surface-elevated px-2 py-1 rounded-lg border border-border-subtle">
              {isEditingMainStats ? <><FiCheck size={12}/> Save</> : <><FiEdit2 size={12}/> Edit</>}
            </button>
          </div>
          <p className="text-xs text-text-muted mt-1">Track your body composition, measurements and overall fitness status.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-border-subtle rounded-xl text-xs font-bold text-text-primary hover:border-purple/50 transition-colors">
            <FiCalendar className="text-purple" />
            <span>May 12 - May 18, 2026</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-border-subtle rounded-xl text-xs font-bold text-text-primary hover:border-purple/50 transition-colors">
            <span>This Week</span>
            <FiChevronDown />
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Weight */}
        <div className="card p-4 bg-gradient-to-br from-surface to-surface-elevated border border-border-subtle space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-info/10 text-info flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><path d="M12 16v-4"></path><path d="M8 8h8"></path></svg>
            </div>
            <div>
              <p className="text-[10px] text-text-muted font-bold">Weight</p>
              {isEditingMainStats ? (
                <input 
                  type="number" 
                  value={bodyStats.weight} 
                  onChange={(e) => handleMainStatChange('weight', e.target.value)}
                  className="w-16 bg-surface border border-border-subtle rounded px-1 text-sm outline-none text-text-primary"
                />
              ) : (
                <h3 className="text-lg font-black text-text-primary">{bodyStats.weight > 0 ? bodyStats.weight : 0} kg</h3>
              )}
            </div>
          </div>
          <p className="text-[9px] font-bold text-success flex items-center gap-1">
            <FiTrendingDown size={10} /> 0.0 kg <span className="text-text-muted font-normal">vs last week</span>
          </p>
        </div>

        {/* Body Fat */}
        <div className="card p-4 bg-gradient-to-br from-surface to-surface-elevated border border-border-subtle space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple/10 text-purple flex items-center justify-center font-bold font-mono">
              %
            </div>
            <div>
              <p className="text-[10px] text-text-muted font-bold">Body Fat</p>
              {isEditingMainStats ? (
                <input 
                  type="number" 
                  value={bodyStats.bodyFat} 
                  onChange={(e) => handleMainStatChange('bodyFat', e.target.value)}
                  className="w-16 bg-surface border border-border-subtle rounded px-1 text-sm outline-none text-text-primary"
                />
              ) : (
                <h3 className="text-lg font-black text-text-primary">{bodyStats.bodyFat > 0 ? bodyStats.bodyFat : 0} %</h3>
              )}
            </div>
          </div>
          <p className="text-[9px] font-bold text-success flex items-center gap-1">
            <FiTrendingDown size={10} /> 0.0% <span className="text-text-muted font-normal">vs last week</span>
          </p>
        </div>

        {/* Muscle Mass */}
        <div className="card p-4 bg-gradient-to-br from-surface to-surface-elevated border border-border-subtle space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center font-bold">
              💪
            </div>
            <div>
              <p className="text-[10px] text-text-muted font-bold whitespace-nowrap">Muscle Mass</p>
              {isEditingMainStats ? (
                <input 
                  type="number" 
                  value={bodyStats.muscleMass} 
                  onChange={(e) => handleMainStatChange('muscleMass', e.target.value)}
                  className="w-16 bg-surface border border-border-subtle rounded px-1 text-sm outline-none text-text-primary"
                />
              ) : (
                <h3 className="text-lg font-black text-text-primary">{bodyStats.muscleMass > 0 ? bodyStats.muscleMass : 0} kg</h3>
              )}
            </div>
          </div>
          <p className="text-[9px] font-bold text-success flex items-center gap-1">
            <FiTrendingUp size={10} /> 0.0 kg <span className="text-text-muted font-normal">vs last week</span>
          </p>
        </div>

        {/* BMI */}
        <div className="card p-4 bg-gradient-to-br from-surface to-surface-elevated border border-border-subtle space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <FiActivity size={16} />
            </div>
            <div>
              <p className="text-[10px] text-text-muted font-bold">BMI</p>
              {isEditingMainStats ? (
                <input 
                  type="number" 
                  value={bodyStats.bmi} 
                  onChange={(e) => handleMainStatChange('bmi', e.target.value)}
                  className="w-16 bg-surface border border-border-subtle rounded px-1 text-sm outline-none text-text-primary"
                />
              ) : (
                <h3 className="text-lg font-black text-text-primary">{bodyStats.bmi > 0 ? bodyStats.bmi : 0}</h3>
              )}
            </div>
          </div>
          <p className="text-[9px] font-bold text-text-muted flex items-center gap-1">
            -
          </p>
        </div>

        {/* Body Water */}
        <div className="card p-4 bg-gradient-to-br from-surface to-surface-elevated border border-border-subtle space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <FiDroplet size={16} />
            </div>
            <div>
              <p className="text-[10px] text-text-muted font-bold">Body Water</p>
              {isEditingMainStats ? (
                <input 
                  type="number" 
                  value={bodyStats.bodyWater} 
                  onChange={(e) => handleMainStatChange('bodyWater', e.target.value)}
                  className="w-16 bg-surface border border-border-subtle rounded px-1 text-sm outline-none text-text-primary"
                />
              ) : (
                <h3 className="text-lg font-black text-text-primary">{bodyStats.bodyWater > 0 ? bodyStats.bodyWater : 0} %</h3>
              )}
            </div>
          </div>
          <p className="text-[9px] font-bold text-text-muted flex items-center gap-1">
            <FiTrendingUp size={10} /> 0.0% <span className="text-text-muted font-normal">vs last week</span>
          </p>
        </div>

        {/* Visceral Fat */}
        <div className="card p-4 bg-gradient-to-br from-surface to-surface-elevated border border-border-subtle space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center font-bold">
              🍎
            </div>
            <div>
              <p className="text-[10px] text-text-muted font-bold whitespace-nowrap">Visceral Fat</p>
              {isEditingMainStats ? (
                <input 
                  type="number" 
                  value={bodyStats.visceralFat} 
                  onChange={(e) => handleMainStatChange('visceralFat', e.target.value)}
                  className="w-16 bg-surface border border-border-subtle rounded px-1 text-sm outline-none text-text-primary"
                />
              ) : (
                <h3 className="text-lg font-black text-text-primary">{bodyStats.visceralFat > 0 ? bodyStats.visceralFat : 0}</h3>
              )}
            </div>
          </div>
          <p className="text-[9px] font-bold text-text-muted flex items-center gap-1">
            -
          </p>
        </div>
      </div>

      {/* Middle Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Trend Chart */}
        <div className="lg:col-span-5 card p-5 border border-border-subtle bg-surface">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-text-primary">Body Composition Trend</h3>
            <button className="text-xs flex items-center gap-1 text-text-muted hover:text-text-primary">
              6 Weeks <FiChevronDown />
            </button>
          </div>
          
          <div className="flex gap-4 mb-4 text-[9px] font-bold">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple"></div>Weight (kg)</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-warning"></div>Body Fat (%)</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-success"></div>Muscle Mass (kg)</span>
          </div>
          
          {/* SVG Line Chart */}
          <div className="w-full h-48 relative">
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-text-muted font-mono h-[calc(100%-24px)]">
              <span>80</span>
              <span>60</span>
              <span>40</span>
              <span>20</span>
              <span>0</span>
            </div>
            
            <div className="absolute left-6 right-0 top-2 bottom-6">
              <div className="w-full h-full flex flex-col justify-between border-l border-border-subtle relative z-0">
                {[0, 1, 2, 3, 4].map((_, i) => (
                  <div key={i} className="w-full border-b border-border-subtle/30" style={{ height: '0px' }}></div>
                ))}
                
                <svg className="absolute inset-0 w-full h-full z-10 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  {checkpointsList.length > 0 ? (
                    <>
                      {/* Weight Line */}
                      <polyline 
                        points={[...checkpointsList].reverse().map((cp, i, arr) => {
                          const x = (i / Math.max(1, arr.length - 1)) * 100;
                          const y = 100 - (Math.min(cp.weight_kg || 0, 80) / 80) * 100;
                          return `${x},${y}`;
                        }).join(' ')} 
                        fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                      />
                      {/* Body Fat Line */}
                      <polyline 
                        points={[...checkpointsList].reverse().map((cp, i, arr) => {
                          const x = (i / Math.max(1, arr.length - 1)) * 100;
                          const y = 100 - (Math.min(cp.body_fat_pct || 0, 80) / 80) * 100;
                          return `${x},${y}`;
                        }).join(' ')} 
                        fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                      />
                      {/* Muscle Mass Line */}
                      <polyline 
                        points={[...checkpointsList].reverse().map((cp, i, arr) => {
                          const x = (i / Math.max(1, arr.length - 1)) * 100;
                          const y = 100 - (Math.min(cp.muscle_mass_kg || 0, 80) / 80) * 100;
                          return `${x},${y}`;
                        }).join(' ')} 
                        fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                      />
                    </>
                  ) : (
                    <polyline points="0,95 100,95" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
              </div>
            </div>
            
            <div className="absolute left-6 right-0 bottom-0 flex justify-between text-[9px] text-text-muted">
              {checkpointsList.length > 0 ? (
                [...checkpointsList].reverse().slice(-5).map((cp, i) => (
                  <span key={i}>{new Date(cp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                ))
              ) : (
                <span>No Data</span>
              )}
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="lg:col-span-3 card p-5 border border-border-subtle bg-surface">
          <h3 className="text-sm font-bold text-text-primary mb-6">Body Composition</h3>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 h-full pb-4">
            <div className="relative w-36 h-36 rounded-full flex items-center justify-center" style={{
              background: bodyStats.weight > 0 ? `conic-gradient(#22c55e 0% 80.9%, #f59e0b 80.9% 97.1%, #3b82f6 97.1% 99%, #64748b 99% 100%)` : `#2c2c35`
            }}>
              <div className="absolute inset-4 rounded-full bg-surface flex flex-col items-center justify-center">
                <span className="text-lg font-black text-text-primary">{bodyStats.weight > 0 ? bodyStats.weight : 0} kg</span>
                <span className="text-[8px] text-text-muted font-bold uppercase tracking-wider">Total Weight</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-3 w-full">
              {[
                { name: 'Muscle Mass', val: bodyStats.muscleMass > 0 ? `${bodyStats.muscleMass} kg` : '0 kg', color: 'bg-success' },
                { name: 'Fat Mass', val: bodyStats.bodyFat > 0 ? `${(bodyStats.weight * (bodyStats.bodyFat/100)).toFixed(1)} kg` : '0 kg', color: 'bg-warning' },
                { name: 'Bone Mass', val: bodyStats.weight > 0 ? `${(bodyStats.weight * 0.04).toFixed(1)} kg` : '0 kg', color: 'bg-blue-500' },
                { name: 'Other (Water, Organs)', val: bodyStats.weight > 0 ? 'Rest' : '0', color: 'bg-slate-500' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.color}`}></div>
                    <span className="text-[10px] text-text-muted font-bold">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-text-primary pl-3">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Segmental Analysis */}
        <div className="lg:col-span-4 card p-5 border border-border-subtle bg-surface relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-text-primary">Segmental Analysis</h3>
            <div className="flex gap-2">
              <span className="text-[9px] bg-purple text-white px-2 py-0.5 rounded font-bold">Muscle Mass</span>
              <span className="text-[9px] bg-surface-elevated text-text-muted px-2 py-0.5 rounded font-bold">Fat %</span>
            </div>
          </div>

          <div className="flex">
            <div className="w-48 h-[260px] relative flex items-center justify-center shrink-0 -ml-8 -mt-6 -mb-6">
              <MuscleDiagram 
                minimalMode={true} 
                activeExercises={[{ primary: ['chest', 'core'], secondary: [] }]} 
                className="scale-90"
              />
            </div>
            
            {/* Stats list */}
            <div className="flex-1 flex flex-col justify-between py-4 space-y-4">
              {[
                { name: 'Arms', left: '0 kg', right: '0 kg', status: '-', statusColor: 'text-text-muted' },
                { name: 'Chest', left: '0 kg', right: '', status: '-', statusColor: 'text-text-muted' },
                { name: 'Legs', left: '0 kg', right: '0 kg', status: '-', statusColor: 'text-text-muted' },
                { name: 'Core', left: '0 kg', right: '', status: '-', statusColor: 'text-text-muted' },
              ].map((part, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-text-muted text-[10px] font-bold block">{part.name}</span>
                    <span className="font-mono text-text-primary text-[10px]">
                      {part.left} {part.right ? <span className="text-text-muted">| {part.right}</span> : ''}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold ${part.statusColor}`}>{part.status}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="absolute bottom-4 right-4 flex gap-3 text-[8px] text-text-muted font-bold">
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-success rounded-sm"></div>Good</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-warning rounded-sm"></div>Average</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-danger rounded-sm"></div>Needs Work</span>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Body Measurements */}
        <div className="lg:col-span-4 card p-5 border border-border-subtle bg-surface flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <FiDroplet size={14} className="text-text-muted" /> Body Measurements
            </h3>
            <button onClick={() => {
              if (isEditingMeasurements) {
                saveStatsToBackend(bodyStats);
              }
              setIsEditingMeasurements(!isEditingMeasurements);
            }} className="text-[10px] text-purple font-bold hover:underline flex items-center gap-1">
              {isEditingMeasurements ? <><FiCheck size={12}/> Save</> : <><FiEdit2 size={12}/> Edit</>}
            </button>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-[9px] text-text-muted uppercase tracking-wider">
                  <th className="pb-2">Measurement</th>
                  <th className="pb-2 text-right">Current (cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {['Neck', 'Chest', 'Waist', 'Hips', 'Right Arm', 'Left Arm', 'Right Thigh', 'Left Thigh'].map((name, i) => (
                  <tr key={i}>
                    <td className="py-2.5 font-bold text-text-primary text-[10px]">{name}</td>
                    <td className="py-2.5 text-right font-mono text-text-primary">
                      {isEditingMeasurements ? (
                        <input 
                          type="number"
                          value={bodyStats.measurements?.[name] || 0}
                          onChange={(e) => handleMeasurementChange(name, e.target.value)}
                          className="w-16 bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-right outline-none focus:border-purple"
                        />
                      ) : (
                        `${bodyStats.measurements?.[name] || 0} cm`
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Health Indicators & Summary */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Indicators List */}
          <div className="card p-5 border border-border-subtle bg-surface flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <FiActivity size={14} className="text-text-muted" /> Health Indicators
              </h3>
              <button onClick={() => {
                if (isEditingHealth) {
                  saveStatsToBackend(bodyStats);
                }
                setIsEditingHealth(!isEditingHealth);
              }} className="text-[10px] text-purple font-bold hover:underline flex items-center gap-1">
                {isEditingHealth ? <><FiCheck size={12}/> Save</> : <><FiEdit2 size={12}/> Edit</>}
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                { name: 'Resting Heart Rate', type: 'number', suffix: ' bpm' },
                { name: 'Blood Pressure', type: 'text', suffix: ' mmHg' },
                { name: 'Sleep (Avg)', type: 'number', suffix: ' h' },
                { name: 'Stress Level (Avg)', type: 'text', suffix: '' },
                { name: 'Recovery Score (Avg)', type: 'number', suffix: ' / 100' },
              ].map((ind, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-text-muted text-[10px] font-bold">{ind.name}</span>
                  <div className="flex items-center gap-3">
                    {isEditingHealth ? (
                      <input
                        type={ind.type}
                        value={bodyStats.health?.[ind.name] || ''}
                        onChange={(e) => handleHealthChange(ind.name, e.target.value)}
                        className="w-16 bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-right outline-none focus:border-purple text-[10px] font-mono"
                      />
                    ) : (
                      <span className="font-mono text-text-primary text-[10px]">{bodyStats.health?.[ind.name] || 0}{ind.suffix}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Body Status Summary */}
          <div className="card p-5 border border-border-subtle bg-gradient-to-br from-surface to-surface-elevated flex flex-col">
            <h3 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-1.5">
              <FiShield size={14} className="text-text-muted" /> Body Status Summary
            </h3>
            <p className="text-[10px] text-text-muted mb-6 leading-relaxed">
              Track your metrics daily to get personalized recommendations and see your overall body status improve.
            </p>
            
            <div className="flex justify-between items-center mt-auto mb-4">
              {/* Simple CSS gauge */}
              <div className="relative w-20 h-20 rounded-full flex items-center justify-center" style={{
                background: `conic-gradient(#22c55e 0% 0%, #2c2c35 0% 100%)`
              }}>
                <div className="absolute inset-1.5 rounded-full bg-surface-elevated flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-text-primary">0</span>
                  <span className="text-[7px] text-text-muted font-bold">/100</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-text-muted uppercase">Overall Body Status</p>
                <p className="text-lg font-black text-text-muted mt-1">N/A</p>
              </div>
            </div>
            
            <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple to-purple-accent text-white text-[10px] font-bold hover:brightness-110 transition-all">
              View Recommendations
            </button>
          </div>
        </div>

      </div>

      <ProgressPhotos googleAccessToken={googleAccessToken} googleDriveFolderLink={googleDriveFolderLink} />
    </motion.div>
  );
}
