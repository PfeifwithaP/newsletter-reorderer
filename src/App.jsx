import React, { useState } from 'react';
import { Copy, Check, Settings, X } from 'lucide-react';

export default function NewsletterReorderer() {
  const [stories, setStories] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [copied, setCopied] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [outletPriority, setOutletPriority] = useState(() => {
    const stored = localStorage.getItem('outletPriority');
    return stored ? JSON.parse(stored) : ['NYT', 'WSJ', 'WaPo', 'Bloomberg', 'NPR', 'The Atlantic', 'Chronicle', 'People'];
  });
  const [makeWebhookUrl, setMakeWebhookUrl] = useState(() => {
    return localStorage.getItem('makeWebhookUrl') || '';
  });
  const [driveFileId, setDriveFileId] = useState(() => {
    return localStorage.getItem('driveFileId') || '17n4JxDuqwEWK3JqHyHwTJZajgIYlfqxx';
  });
  const [loadingFromDrive, setLoadingFromDrive] = useState(false);

  // Load outlet map from localStorage or use defaults
  const defaultOutletMap = {
    'nytimes.com': 'NYT',
    'wsj.com': 'WSJ',
    'washingtonpost.com': 'WaPo',
    'bloomberg.com': 'Bloomberg',
    'charlotteobserver.com': 'Charlotte Observer',
    'newsobserver.com': 'Raleigh N&O',
    'theatlantic.com': 'The Atlantic',
    'people.com': 'People',
    'chronicle.com': 'Chronicle',
    'www-chronicle-com.proxy048.nclive.org': 'Chronicle',
    'theguardian.com': 'The Guardian',
    'insidehighered.com': 'Inside Higher Ed',
    'timeshighereducation.com': 'Times Higher Ed',
    'nature.com': 'Nature',
    'science.org': 'Science',
    'sciencedaily.com': 'Science Daily',
  };

  const [outletMap, setOutletMapState] = useState(() => {
    const stored = localStorage.getItem('outletMap');
    return stored ? JSON.parse(stored) : defaultOutletMap;
  });

  const saveOutletMap = (newMap) => {
    setOutletMapState(newMap);
    localStorage.setItem('outletMap', JSON.stringify(newMap));
  };

  const handleOutletChange = (domain, newNickname) => {
    const updated = { ...outletMap, [domain]: newNickname };
    saveOutletMap(updated);
  };

  const addNewOutlet = () => {
    if (newDomain.trim() && newNickname.trim()) {
      const updated = { ...outletMap, [newDomain.trim()]: newNickname.trim() };
      saveOutletMap(updated);
      setNewDomain('');
      setNewNickname('');
      return true;
    }
    return false;
  };

  const deleteOutlet = (domain) => {
    const updated = { ...outletMap };
    delete updated[domain];
    saveOutletMap(updated);
  };

  const resetToDefaults = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Reset all outlets to defaults?')) {
      saveOutletMap(defaultOutletMap);
    }
  };

  const startEditingTitle = (story) => {
    setEditingId(story._id);
    setEditingTitle(story.title);
  };

  const saveEditedTitle = () => {
    if (editingId !== null) {
      const updatedStories = stories.map((s) =>
        s._id === editingId ? { ...s, title: editingTitle } : s
      );
      setStories(updatedStories);
      setEditingId(null);
      setEditingTitle('');
    }
  };

  const cancelEditingTitle = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const saveOutletPriority = (newPriority) => {
    setOutletPriority(newPriority);
    localStorage.setItem('outletPriority', JSON.stringify(newPriority));
  };

  const autoSortByOutletPriority = () => {
    const sortedStories = [...stories].sort((a, b) => {
      // If different categories, keep original category order
      if (a.SortKey !== b.SortKey) {
        return a.SortKey.localeCompare(b.SortKey);
      }

      // Within same category, sort by outlet priority
      const aOutlet = a.outlet || '';
      const bOutlet = b.outlet || '';

      const aPriority = outletPriority.indexOf(aOutlet);
      const bPriority = outletPriority.indexOf(bOutlet);

      // If both in priority list, sort by priority
      if (aPriority !== -1 && bPriority !== -1) {
        return aPriority - bPriority;
      }

      // If only one in priority list, it comes first
      if (aPriority !== -1) return -1;
      if (bPriority !== -1) return 1;

      // If neither in list, keep original order
      return 0;
    });

    setStories(sortedStories);
  };

  const movePriorityUp = (index) => {
    if (index > 0) {
      const newPriority = [...outletPriority];
      [newPriority[index], newPriority[index - 1]] = [newPriority[index - 1], newPriority[index]];
      saveOutletPriority(newPriority);
    }
  };

  const movePriorityDown = (index) => {
    if (index < outletPriority.length - 1) {
      const newPriority = [...outletPriority];
      [newPriority[index], newPriority[index + 1]] = [newPriority[index + 1], newPriority[index]];
      saveOutletPriority(newPriority);
    }
  };

  const removePriorityOutlet = (index) => {
    const newPriority = outletPriority.filter((_, i) => i !== index);
    saveOutletPriority(newPriority);
  };

  const addPriorityOutlet = (outlet) => {
    if (outlet && !outletPriority.includes(outlet)) {
      saveOutletPriority([...outletPriority, outlet]);
    }
  };

  const saveMakeWebhookUrl = (url) => {
    setMakeWebhookUrl(url);
    localStorage.setItem('makeWebhookUrl', url);
  };

  const saveDriveFileId = (id) => {
    setDriveFileId(id);
    localStorage.setItem('driveFileId', id);
  };

  const loadFromDrive = async () => {
    if (!driveFileId) {
      alert('Please enter your Google Drive file ID in Settings first!');
      return;
    }
    setLoadingFromDrive(true);
    try {
      const url = `https://drive.google.com/uc?export=download&id=${driveFileId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch file from Google Drive');
      const text = await response.text();
      parseJson(text);
    } catch (error) {
      alert(`❌ Error loading from Google Drive: ${error.message}`);
    } finally {
      setLoadingFromDrive(false);
    }
  };

  const sendToMake = async () => {
    if (!makeWebhookUrl) {
      alert('Please enter your Make webhook URL in Settings first!');
      return;
    }

    try {
      const output = stories.map((s) => {
        const titleWithOutlet = s.outlet ? `${s.outlet}: ${s.title}` : s.title;
        return {
          _id: s._id,
          tags: s.tags,
          SortKey: s.SortKey,
          ArticleBlock: `<div style="margin-bottom: 20px; font-family: sans-serif; font-size: 14px; line-height: 1.5;">
   <a href="${s.link}" style="text-decoration: none; color: #000000; font-size: 16px;">
      <b>${titleWithOutlet}</b>
   </a>
   <div style="margin-top: 4px; color: #333333;">
      ${s.excerpt || ''}
   </div>
</div>`,
          link: s.link,
          title: titleWithOutlet,
          excerpt: s.excerpt,
        };
      });

      await fetch(makeWebhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(output),
      });
      alert('✅ Stories sent to Make! Your workflow will resume now.');
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  const getOutletName = (url) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return outletMap[domain] || domain.split('.')[0];
    } catch {
      return 'Source';
    }
  };

  const parseJson = (input) => {
    try {
      let cleanedInput = input.trim();
      
      // Remove outer braces - handle {{{ or { wrapping
      while (cleanedInput.startsWith('{') && cleanedInput.endsWith('}')) {
        const innerContent = cleanedInput.slice(1, -1).trim();
        if (innerContent.startsWith('[')) {
          cleanedInput = innerContent;
          break;
        } else if (innerContent.startsWith('{')) {
          cleanedInput = innerContent;
        } else {
          break;
        }
      }
      
      const parsed = JSON.parse(cleanedInput);
      let stories = [];
      
      // Handle both formats: plain array or object with array property
      if (Array.isArray(parsed)) {
        stories = parsed;
      } else if (parsed.array && Array.isArray(parsed.array)) {
        stories = parsed.array;
      } else {
        throw new Error('Expected an array or object with an array property');
      }
      
      const withOutlets = stories.map((item) => ({
        ...item,
        outlet: getOutletName(item.link || ''),
      }));
      setStories(withOutlets);
      setJsonInput('');
    } catch (e) {
      console.error('Parse error:', e);
      alert('Invalid JSON. Make sure you paste the aggregator output.');
    }
  };

  const handleDragStart = (index, category) => {
    setDraggedItem({ index, category });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex, targetCategory) => {
    if (!draggedItem) return;

    const newStories = [...stories];
    const sourceCategory = draggedItem.category;
    const sourceIndex = draggedItem.index;

    if (sourceCategory === targetCategory) {
      // Reorder within same category
      const sourceItem = newStories[sourceIndex];
      newStories.splice(sourceIndex, 1);

      const adjustedTargetIndex =
        sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
      newStories.splice(adjustedTargetIndex, 0, sourceItem);

      setStories(newStories);
    }

    setDraggedItem(null);
  };

  const exportJson = () => {
    const output = stories.map((s) => {
      // Prepend outlet to title
      const titleWithOutlet = s.outlet ? `${s.outlet}: ${s.title}` : s.title;
      return {
        _id: s._id,
        tags: s.tags,
        SortKey: s.SortKey,
        ArticleBlock: `<div style="margin-bottom: 20px; font-family: sans-serif; font-size: 14px; line-height: 1.5;">
   <a href="${s.link}" style="text-decoration: none; color: #000000; font-size: 16px;">
      <b>${titleWithOutlet}</b>
   </a>
   <div style="margin-top: 4px; color: #333333;">
      ${s.excerpt || ''}
   </div>
</div>`,
        link: s.link,
        title: titleWithOutlet,
        excerpt: s.excerpt,
      };
    });

    const json = JSON.stringify(output, null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    return output;
  };



  const groupedStories = {
    '1. Davidson In The News': stories.filter((s) => s.SortKey === '1. Davidson In The News'),
    '2. Higher Ed Headlines': stories.filter((s) => s.SortKey === '2. Higher Ed Headlines'),
    '3. Trades': stories.filter((s) => s.SortKey === '3. Trades'),
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h1 style={{ color: '#d42121', margin: '0' }}>Newsletter Story Reorderer</h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            padding: '8px 12px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Settings size={18} /> Settings
        </button>
      </div>
      <p style={{ color: '#666', marginBottom: '20px' }}>Paste the Make aggregator output, drag stories to reorder within categories, then copy the exported JSON to paste back into Make.</p>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Outlet Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Add new outlet */}
            <div style={{ marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Add New Outlet</h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Domain (e.g., example.com)"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
                <input
                  type="text"
                  placeholder="Nickname (e.g., Example)"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
                <button
                  onClick={addNewOutlet}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Existing outlets */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Current Outlets</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(outletMap)
                  .sort((a, b) => a[1].localeCompare(b[1]))
                  .map(([domain, nickname]) => (
                    <div key={domain} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => handleOutletChange(domain, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px',
                        }}
                      />
                      <span style={{ fontSize: '12px', color: '#999', minWidth: '200px', textAlign: 'right' }}>
                        {domain}
                      </span>
                      <button
                        onClick={() => deleteOutlet(domain)}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: '#ff4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Google Drive File ID */}
            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Google Drive File ID</h3>
              <p style={{ fontSize: '12px', color: '#666', marginTop: 0, marginBottom: '12px' }}>
                The ID of your Today's_Clips_JSON.txt file in Google Drive. Find it in the file's URL.
              </p>
              <input
                type="text"
                placeholder="17n4JxDuqwEWK3JqHyHwTJZajgIYlfqxx"
                value={driveFileId}
                onChange={(e) => saveDriveFileId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  boxSizing: 'border-box',
                }}
              />
              {driveFileId && (
                <div style={{ fontSize: '12px', color: '#4CAF50', marginTop: '8px' }}>
                  ✓ File ID saved
                </div>
              )}
            </div>

            {/* Make Webhook URL */}
            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Make Webhook URL</h3>
              <p style={{ fontSize: '12px', color: '#666', marginTop: 0, marginBottom: '12px' }}>
                Paste your Make webhook URL here. When you click "Send to Make", your reordered stories will be sent to Make and your workflow will resume.
              </p>
              <input
                type="text"
                placeholder="https://hook.make.com/..."
                value={makeWebhookUrl}
                onChange={(e) => saveMakeWebhookUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  boxSizing: 'border-box',
                }}
              />
              {makeWebhookUrl && (
                <div style={{ fontSize: '12px', color: '#4CAF50', marginTop: '8px' }}>
                  ✓ Webhook URL saved
                </div>
              )}
            </div>

            {/* Outlet Priority Order */}
            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Outlet Priority Order</h3>
              <p style={{ fontSize: '12px', color: '#666', marginTop: 0, marginBottom: '12px' }}>
                When you click "Auto-sort by Priority", stories are reordered by this list (most important first).
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {outletPriority.map((outlet, idx) => (
                  <div
                    key={outlet}
                    style={{
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center',
                      padding: '8px',
                      backgroundColor: '#f9f9f9',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#999', minWidth: '20px' }}>
                      {idx + 1}.
                    </span>
                    <span style={{ flex: 1, fontWeight: '500' }}>{outlet}</span>
                    <button
                      onClick={() => movePriorityUp(idx)}
                      disabled={idx === 0}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: idx === 0 ? '#f0f0f0' : '#2196F3',
                        color: idx === 0 ? '#ccc' : 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: idx === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => movePriorityDown(idx)}
                      disabled={idx === outletPriority.length - 1}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: idx === outletPriority.length - 1 ? '#f0f0f0' : '#2196F3',
                        color: idx === outletPriority.length - 1 ? '#ccc' : 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: idx === outletPriority.length - 1 ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removePriorityOutlet(idx)}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: '#ff4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addPriorityOutlet(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  <option value="">Add outlet to priority list...</option>
                  {Object.values(outletMap)
                    .filter((outlet) => !outletPriority.includes(outlet))
                    .map((outlet) => (
                      <option key={outlet} value={outlet}>
                        {outlet}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Reset button */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={resetToDefaults}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Reset to Defaults
              </button>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#333',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontWeight: 'bold' }}>Paste JSON from Make:</label>
          <button
            onClick={loadFromDrive}
            disabled={loadingFromDrive}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1a73e8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loadingFromDrive ? 'wait' : 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            {loadingFromDrive ? '⏳ Loading...' : '📂 Load from Google Drive'}
          </button>
        </div>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Paste the aggregator JSON here, or click 'Load from Google Drive' above..."
          style={{
            width: '100%',
            height: '120px',
            padding: '10px',
            fontFamily: 'monospace',
            fontSize: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={() => parseJson(jsonInput)}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            backgroundColor: '#d42121',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Load Stories
        </button>
      </div>

      {/* Stories Section */}
      {stories.length > 0 && (
        <>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={sendToMake}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6200EA',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Send to Make
            </button>
            <button
              onClick={autoSortByOutletPriority}
              style={{
                padding: '10px 20px',
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Auto-sort by Priority
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#333',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              onClick={exportJson}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {copied ? (
                <>
                  <Check size={18} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={18} /> Export JSON
                </>
              )}
            </button>
          </div>

          {/* Categories with Drag-and-Drop */}
          {Object.entries(groupedStories).map(([category, categoryStories]) => (
            <div key={category} style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#d42121', fontSize: '18px', marginBottom: '15px', textTransform: 'uppercase' }}>
                {category.replace(/^\d\.\s/, '')} ({categoryStories.length})
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {categoryStories.length === 0 ? (
                  <p style={{ color: '#999', fontStyle: 'italic' }}>No stories in this category</p>
                ) : (
                  categoryStories.map((story, idx) => {
                    const absoluteIndex = stories.indexOf(story);
                    return (
                      <div
                        key={absoluteIndex}
                        draggable
                        onDragStart={() => handleDragStart(absoluteIndex, category)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(absoluteIndex, category)}
                        style={{
                          padding: '15px',
                          backgroundColor: draggedItem?.index === absoluteIndex ? '#ffe6e6' : '#ffffff',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          cursor: 'grab',
                          opacity: draggedItem?.index === absoluteIndex ? 0.5 : 1,
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={{ cursor: 'grab', userSelect: 'none', color: '#999', marginTop: '2px' }}>⋮⋮</div>
                          <div style={{ flex: 1 }}>
                            {editingId === story._id ? (
                              <input
                                autoFocus
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEditedTitle();
                                  if (e.key === 'Escape') cancelEditingTitle();
                                }}
                                onBlur={saveEditedTitle}
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  fontSize: '15px',
                                  fontWeight: 'bold',
                                  border: '2px solid #d42121',
                                  borderRadius: '4px',
                                  marginBottom: '6px',
                                }}
                              />
                            ) : (
                              <div
                                onClick={() => startEditingTitle(story)}
                                style={{
                                  fontWeight: 'bold',
                                  fontSize: '15px',
                                  lineHeight: '1.4',
                                  marginBottom: '6px',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  borderRadius: '3px',
                                  transition: 'background-color 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                {story.outlet}: {story.title}
                              </div>
                            )}
                            {story.excerpt && (
                              <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.4' }}>
                                {story.excerpt}
                              </div>
                            )}
                            <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                              {new URL(story.link).hostname}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}

          {/* Preview Section */}
          {showPreview && (
            <div style={{ marginTop: '40px', borderTop: '2px solid #ddd', paddingTop: '20px' }}>
              <h3 style={{ marginBottom: '20px' }}>Email Preview</h3>
              <div
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '20px',
                  backgroundColor: '#f9f9f9',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: 'sans-serif',
                }}
                dangerouslySetInnerHTML={{
                  __html: Object.entries(groupedStories)
                    .filter(([, storyList]) => storyList.length > 0)
                    .map(
                      ([category, categoryStories]) => `
                    <h3 style="color: #d42121; margin-top: 20px; margin-bottom: 10px;">${category.replace(/^\d+\.\s/, '')}</h3>
                    ${categoryStories.map((s) => s.ArticleBlock).join('')}
                  `
                    )
                    .join(''),
                }}
              />
            </div>
          )}

        </>
      )}

      {stories.length === 0 && !jsonInput && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <p>Paste your Make aggregator JSON above to get started</p>
        </div>
      )}
    </div>
  );
}
