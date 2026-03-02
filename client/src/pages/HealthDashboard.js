import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import { getGoals, getMetrics, logMetric, getAnalysis, updateGoals } from '../utils/api';
import GoalSummary from '../components/GoalSummary';
import MetricChart from '../components/MetricChart';
import AIAdvice from '../components/AIAdvice';
import DateScroller from '../components/DateScroller';

const HealthDashboard = () => {
  const { user } = useContext(UserContext);
  const [goals, setGoals] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  // how many days of history for date scroller and metrics (scrollable to any date in this range)
  const DAYS_TO_LOAD = 90;

  const fetchMetrics = async () => {
    if (!user) return [];
    const end = new Date();
    end.setHours(23,59,59,999);
    const start = new Date();
    start.setDate(start.getDate() - (DAYS_TO_LOAD - 1));
    start.setHours(0,0,0,0);
    console.log('HealthDashboard - fetching metrics for date range:', { start: start.toISOString(), end: end.toISOString() });
    const result = await getMetrics(user._id, start.toISOString(), end.toISOString());
    console.log('HealthDashboard - fetchMetrics result:', result);
    return result;
  };

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const g = await getGoals(user._id);
        setGoals(g);
        const m = await fetchMetrics();
        console.log('Metrics fetched:', m);
        setMetrics(m);
        // don't call getAnalysis on initial load - only when user clicks Show Progress
        // select today and prefill values
        const today = new Date();
        today.setHours(0,0,0,0);
        setSelectedDate(today);
        const stepEntry = m.find(x => x.type === 'steps' && new Date(x.date).toDateString() === today.toDateString());
        const sleepEntry = m.find(x => x.type === 'sleep' && new Date(x.date).toDateString() === today.toDateString());
        console.log('Today entries:', { stepEntry, sleepEntry });
        setEntryValues({ steps: stepEntry ? String(stepEntry.value) : '', sleep: sleepEntry ? String(sleepEntry.value) : '' });
      } catch (err) {
        console.error('Error loading dashboard data', err);
      }
    };
    load();
  }, [user]);

  const [selectedDate, setSelectedDate] = useState(null);
  const [entryValues, setEntryValues] = useState({ steps: '', sleep: '' });
  const [showAnalysis, setShowAnalysis] = useState(false);

  // whenever metrics change and we have a selected date, refresh entry values
  useEffect(() => {
    if (selectedDate && metrics.length > 0) {
      console.log('Metrics updated, refreshing entry values for selected date');
      const normalized = new Date(selectedDate);
      normalized.setHours(0,0,0,0);
      const stepEntry = metrics.find(m => {
        const mDate = new Date(m.date);
        mDate.setHours(0,0,0,0);
        return m.type === 'steps' && mDate.toDateString() === normalized.toDateString();
      });
      const sleepEntry = metrics.find(m => {
        const mDate = new Date(m.date);
        mDate.setHours(0,0,0,0);
        return m.type === 'sleep' && mDate.toDateString() === normalized.toDateString();
      });
      console.log('Updated entry values:', { stepEntry, sleepEntry });
      setEntryValues({
        steps: stepEntry ? String(stepEntry.value) : '',
        sleep: sleepEntry ? String(sleepEntry.value) : ''
      });
    }
  }, [metrics, selectedDate]);

  const handleLogForDate = async (date, type, value) => {
    if (!user) return;
    try {
      console.log('Saving:', { userId: user._id, type, value, date: date.toISOString() });
      await logMetric(user._id, type, value, date.toISOString());
      // refresh metrics after save
      const m = await fetchMetrics();
      console.log('Metrics after save:', m);
      setMetrics(m);
      // refresh goals but ignore failures so metric logs still succeed
      try {
        const g = await getGoals(user._id);
        setGoals(g);
      } catch (goalErr) {
        console.error('Failed to refresh goals after logging metric', goalErr);
      }
    } catch (err) {
      console.error('Error logging metric', err);
      throw err;
    }
  };

  const selectDate = (date) => {
    setSelectedDate(date);
    // normalize date to midnight
    const normalized = new Date(date);
    normalized.setHours(0,0,0,0);
    // populate entry values from metrics
    console.log('All metrics:', metrics);
    console.log('Looking for date:', normalized.toDateString());
    const stepEntry = metrics.find(m => {
      const mDate = new Date(m.date);
      mDate.setHours(0,0,0,0);
      const match = m.type === 'steps' && mDate.toDateString() === normalized.toDateString();
      console.log(`Checking step entry:`, { mDate: mDate.toDateString(), normalized: normalized.toDateString(), match });
      return match;
    });
    const sleepEntry = metrics.find(m => {
      const mDate = new Date(m.date);
      mDate.setHours(0,0,0,0);
      const match = m.type === 'sleep' && mDate.toDateString() === normalized.toDateString();
      console.log(`Checking sleep entry:`, { mDate: mDate.toDateString(), normalized: normalized.toDateString(), match });
      return match;
    });
    console.log('selectDate for', normalized.toDateString(), { stepEntry, sleepEntry });
    setEntryValues({
      steps: stepEntry ? String(stepEntry.value) : '',
      sleep: sleepEntry ? String(sleepEntry.value) : ''
    });
    setShowAnalysis(false);
  };

  const saveEntries = async () => {
    if (!selectedDate) return;
    try {
      if (entryValues.steps !== '') {
        await handleLogForDate(selectedDate, 'steps', Number(entryValues.steps));
      }
      if (entryValues.sleep !== '') {
        await handleLogForDate(selectedDate, 'sleep', Number(entryValues.sleep));
      }
      alert('Entries saved');
    } catch (err) {
      console.error('Error saving entries', err);
      // show details so user can see network/validation errors
      alert(`Failed to save entries: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleProgressClick = async () => {
    if (!user) return;
    try {
      const a = await getAnalysis(user._id);
      setAnalysis(a.analysis);
      setShowAnalysis(true);
    } catch (err) {
      console.error('Error fetching analysis', err);
      alert('Failed to load progress analysis');
    }
  };

  // separate metrics into types for charts
  const stepsMetrics = metrics.filter(m => m.type === 'steps');
  const sleepMetrics = metrics.filter(m => m.type === 'sleep');

  // dates that have at least one logged metric (for streak / highlight in date scroller)
  const datesWithData = React.useMemo(() => {
    const set = new Set();
    metrics.forEach(m => {
      const d = new Date(m.date);
      d.setHours(0, 0, 0, 0);
      set.add(d.toDateString());
    });
    return Array.from(set);
  }, [metrics]);

  // current streak: consecutive days with any logged metric, counting back from today
  const currentStreakDays = React.useMemo(() => {
    if (!datesWithData || datesWithData.length === 0) return 0;
    const set = new Set(datesWithData);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    for (;;) {
      const d = new Date(today);
      d.setDate(today.getDate() - streak);
      if (!set.has(d.toDateString())) break;
      streak += 1;
    }
    return streak;
  }, [datesWithData]);

  const [editingGoals, setEditingGoals] = useState(false);
  const [formGoals, setFormGoals] = useState({ stepsGoal: '', sleepGoal: '' });

  const handleEditClick = () => {
    if (goals) {
      setFormGoals({ stepsGoal: goals.stepsGoal || '', sleepGoal: goals.sleepGoal || '' });
    }
    setEditingGoals(true);
  };

  const handleGoalChange = (e) => {
    setFormGoals({ ...formGoals, [e.target.name]: e.target.value });
  };

  const handleGoalSave = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateGoals(user._id, {
        stepsGoal: Number(formGoals.stepsGoal),
        sleepGoal: Number(formGoals.sleepGoal)
      });
      setGoals(updated);
      setEditingGoals(false);
    } catch (err) {
      console.error('Error updating goals', err);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div style={{ marginBottom: '3rem' }}>
        <h1 className="fw-bold" style={{
          background: 'linear-gradient(135deg, #00b894, #6c5ce7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '2.5rem',
          marginBottom: '0.5rem'
        }}>
          Health Dashboard
        </h1>
        <p className="text-muted">Track your daily metrics and achieve your fitness goals</p>
      </div>

      <GoalSummary goals={goals} />
      {!editingGoals && goals && (
        <button className="btn btn-sm" style={{ background: 'linear-gradient(135deg, #00b894, #6c5ce7)', color: '#fff', marginBottom: '1.5rem', borderRadius: '8px' }} onClick={handleEditClick}>
          <i className="bi bi-pencil me-2"></i>Edit Targets
        </button>
      )}
      {editingGoals && (
        <div className="card mb-4" style={{ borderRadius: '12px' }}>
          <div className="card-body">
            <form onSubmit={handleGoalSave}>
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label className="form-label fw-bold">Daily Steps Goal</label>
                  <input
                    type="number"
                    className="form-control"
                    name="stepsGoal"
                    value={formGoals.stepsGoal}
                    onChange={handleGoalChange}
                    style={{ borderRadius: '8px' }}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Sleep Goal (hrs)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="sleepGoal"
                    value={formGoals.sleepGoal}
                    onChange={handleGoalChange}
                    style={{ borderRadius: '8px' }}
                  />
                </div>
                <div className="col-md-4 d-flex gap-2">
                  <button className="btn fw-bold" style={{ background: 'linear-gradient(135deg, #00b894, #6c5ce7)', color: '#fff', borderRadius: '8px' }}>Save</button>
                  <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: '8px' }} onClick={() => setEditingGoals(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h5 className="fw-bold text-muted mb-3">Log Your Metrics</h5>
        <DateScroller
          daysBack={DAYS_TO_LOAD}
          daysForward={0}
          selectedDate={selectedDate}
          onSelect={selectDate}
          datesWithData={datesWithData}
          streakDays={currentStreakDays}
        />
      </div>

      {selectedDate && (
        <div className="card mb-4" style={{ borderRadius: '12px' }}>
          <div className="card-body">
            <h5 className="card-title fw-bold mb-4" style={{ color: '#00b894' }}>
              <i className="bi bi-calendar-check me-2"></i>
              Entry for {selectedDate.toDateString()}
            </h5>
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label fw-bold">Steps</label>
                <div className="input-group" style={{ borderRadius: '8px' }}>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter steps"
                    value={entryValues.steps || ''}
                    onChange={e => setEntryValues({ ...entryValues, steps: e.target.value })}
                    style={{ borderRadius: '8px' }}
                  />
                  <span className="input-group-text" style={{ background: '#f1f2f6', border: 'none', borderRadius: '0 8px 8px 0' }}>🚶</span>
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Sleep (hrs)</label>
                <div className="input-group" style={{ borderRadius: '8px' }}>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter hours"
                    value={entryValues.sleep || ''}
                    onChange={e => setEntryValues({ ...entryValues, sleep: e.target.value })}
                    style={{ borderRadius: '8px' }}
                  />
                  <span className="input-group-text" style={{ background: '#f1f2f6', border: 'none', borderRadius: '0 8px 8px 0' }}>😴</span>
                </div>
              </div>
              <div className="col-md-4">
                <button className="btn w-100 fw-bold" style={{ background: 'linear-gradient(135deg, #00b894, #6c5ce7)', color: '#fff', borderRadius: '8px' }} onClick={saveEntries}>
                  <i className="bi bi-check-circle me-2"></i>Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex gap-2 mb-4">
        <button className="btn fw-bold" style={{ background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', color: '#fff', borderRadius: '8px' }} onClick={handleProgressClick}>
          <i className="bi bi-graph-up me-2"></i>Show Progress
        </button>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card" style={{ borderRadius: '12px' }}>
            <div className="card-header bg-white border-bottom" style={{ borderRadius: '12px 12px 0 0' }}>
              <h6 className="fw-bold mb-0" style={{ color: '#00b894' }}>
                <i className="bi bi-diagram-3 me-2"></i>Steps Over Time
              </h6>
            </div>
            <div className="card-body">
              <MetricChart metrics={stepsMetrics} goals={goals} type="steps" />
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card" style={{ borderRadius: '12px' }}>
            <div className="card-header bg-white border-bottom" style={{ borderRadius: '12px 12px 0 0' }}>
              <h6 className="fw-bold mb-0" style={{ color: '#6c5ce7' }}>
                <i className="bi bi-moon-stars me-2"></i>Sleep Over Time
              </h6>
            </div>
            <div className="card-body">
              <MetricChart metrics={sleepMetrics} goals={goals} type="sleep" />
            </div>
          </div>
        </div>
      </div>

      {showAnalysis && <AIAdvice analysis={analysis} />}
    </div>
  );
};

export default HealthDashboard;
