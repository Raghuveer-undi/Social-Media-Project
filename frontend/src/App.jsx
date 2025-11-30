import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {
  Send, Loader2, Sparkles, Layout,
  Lightbulb, Calendar, Feather, Globe,
  Copy, Check
} from 'lucide-react';
import './index.css';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://social-media-project-pmlz.onrender.com';

function App() {
  const [activeTab, setActiveTab] = useState('post');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Unified Form State
  const [formData, setFormData] = useState({
    topic: '',
    niche: '',
    platform: 'LinkedIn',
    platformsInput: 'LinkedIn, Twitter',
    tone: 'Professional',
    ideaCount: 5,
    duration: '1 Week'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let endpoint = '';
      let payload = {};
      let responseKey = '';

      switch (activeTab) {
        case 'post':
          endpoint = '/generate-post';
          payload = {
            topic: formData.topic,
            platform: formData.platform,
            tone: formData.tone
          };
          responseKey = 'final_content';
          break;

        case 'ideas':
          endpoint = '/generate-ideas';
          payload = {
            niche: formData.niche,
            count: parseInt(formData.ideaCount)
          };
          responseKey = 'ideas';
          break;

        case 'plan':
          endpoint = '/generate-plan';
          const platformList = formData.platformsInput.split(',').map(p => p.trim()).filter(p => p);
          payload = {
            niche: formData.niche,
            platforms: platformList,
            duration: formData.duration
          };
          responseKey = 'strategy_and_plan';
          break;
        default:
          break;
      }

      const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
      setResult(response.data[responseKey]);

    } catch (err) {
      setError('Failed to contact the agent. Please check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <header>
          <div className="badge">AI AGENT V2.0</div>
          <h1>Social Command Center</h1>
          <p className="subtitle">
            Research-backed content, viral ideas, and strategic planning.
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'post' ? 'active' : ''}`}
            onClick={() => { setActiveTab('post'); setResult(null); }}
          >
            <Feather size={18} /> Viral Post
          </button>
          <button
            className={`tab-btn ${activeTab === 'ideas' ? 'active' : ''}`}
            onClick={() => { setActiveTab('ideas'); setResult(null); }}
          >
            <Lightbulb size={18} /> Brainstorm
          </button>
          <button
            className={`tab-btn ${activeTab === 'plan' ? 'active' : ''}`}
            onClick={() => { setActiveTab('plan'); setResult(null); }}
          >
            <Calendar size={18} /> Strategy Plan
          </button>
        </div>

        <div className="grid-layout">
          {/* Input Section */}
          <div className="input-section">
            <div className="card input-card">
              <h2 className="card-header">
                <Layout size={20} className="icon-accent" />
                {activeTab === 'post' && 'Post Details'}
                {activeTab === 'ideas' && 'Niche Settings'}
                {activeTab === 'plan' && 'Campaign Settings'}
              </h2>

              <form onSubmit={handleSubmit}>
                {/* --- INPUTS FOR POST GENERATION --- */}
                {activeTab === 'post' && (
                  <>
                    <div className="form-group">
                      <label>Topic / News Hook</label>
                      <input
                        name="topic"
                        type="text"
                        value={formData.topic}
                        onChange={handleInputChange}
                        placeholder="e.g., The future of AI Agents"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Platform</label>
                      <select name="platform" value={formData.platform} onChange={handleInputChange}>
                        <option>LinkedIn</option>
                        <option>Twitter / X</option>
                        <option>Instagram</option>
                        <option>Medium</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Tone</label>
                      <select name="tone" value={formData.tone} onChange={handleInputChange}>
                        <option>Professional & Witty</option>
                        <option>Controversial</option>
                        <option>Educational</option>
                        <option>Casual</option>
                      </select>
                    </div>
                  </>
                )}

                {/* --- INPUTS FOR IDEAS & PLAN --- */}
                {(activeTab === 'ideas' || activeTab === 'plan') && (
                  <div className="form-group">
                    <label>Target Niche</label>
                    <input
                      name="niche"
                      type="text"
                      value={formData.niche}
                      onChange={handleInputChange}
                      placeholder="e.g., Sustainable Fashion, SaaS Marketing"
                      required
                    />
                  </div>
                )}

                {/* --- INPUTS FOR IDEAS ONLY --- */}
                {activeTab === 'ideas' && (
                  <div className="form-group">
                    <label>Number of Ideas</label>
                    <input
                      name="ideaCount"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.ideaCount}
                      onChange={handleInputChange}
                    />
                  </div>
                )}

                {/* --- INPUTS FOR PLAN ONLY --- */}
                {activeTab === 'plan' && (
                  <>
                    <div className="form-group">
                      <label>Platforms (comma separated)</label>
                      <input
                        name="platformsInput"
                        type="text"
                        value={formData.platformsInput}
                        onChange={handleInputChange}
                        placeholder="LinkedIn, Twitter, Instagram"
                      />
                    </div>
                    <div className="form-group">
                      <label>Duration</label>
                      <select name="duration" value={formData.duration} onChange={handleInputChange}>
                        <option>1 Week</option>
                        <option>2 Weeks</option>
                        <option>1 Month</option>
                      </select>
                    </div>
                  </>
                )}

                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? (
                    <>
                      <Loader2 size={20} className="spin" />
                      {activeTab === 'post' ? 'Researching & Writing...' : 'Thinking...'}
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      {activeTab === 'post' && 'Generate Viral Post'}
                      {activeTab === 'ideas' && 'Find Content Gaps'}
                      {activeTab === 'plan' && 'Build Strategy'}
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="tips-box">
              <Globe size={16} />
              <span>
                {activeTab === 'post' && 'Uses real-time search to verify facts.'}
                {activeTab === 'ideas' && 'Analyzes psychological hooks.'}
                {activeTab === 'plan' && 'Aligns content with current trends.'}
              </span>
            </div>
          </div>

          {/* Output Section - ONLY ONE INSTANCE HERE */}
          <div className="result-section">
            {error && (
              <div className="error-msg">
                <Layout size={20} />
                {error}
              </div>
            )}

            {!result && !loading && (
              <div className="empty-state">
                <Sparkles size={48} className="empty-icon" />
                <h3>Ready to Create</h3>
                <p>Select a mode and enter details to unleash the agent.</p>
              </div>
            )}

            {result && (
              <div className="card result-card">
                <div className="result-header">
                  <h3>
                    <Sparkles size={18} className="icon-accent" />
                    Agent Output
                  </h3>
                  <button onClick={handleCopy} className="copy-btn">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                <div className="agent-output">
                  <ReactMarkdown>
                    {result}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
