import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function NewsletterReorderer() {
  const [stories, setStories] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [copied, setCopied] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);


  // Outlet mapping
  const outletMap = {
    'nytimes.com': 'NYT',
    'wsj.com': 'WSJ',
    'washingtonpost.com': 'WaPo',
    'bloomberg.com': 'Bloomberg',
    'charlotteobserver.com': 'Charlotte Observer',
    'newsobserver.com': 'Raleigh N&O',
    'theguardian.com': 'The Guardian',
    'chronicle.com': 'Chronicle',
    'insidehighered.com': 'Inside Higher Ed',
    'timeshighereducation.com': 'Times Higher Ed',
    'nature.com': 'Nature',
    'science.org': 'Science',
    'sciencedaily.com': 'Science Daily',
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
      
      // Remove outer braces if it's wrapped like {[...]}
      if (cleanedInput.startsWith('{') && cleanedInput.endsWith('}')) {
        // Try to find the array inside
        const arrayMatch = cleanedInput.match(/\[\{.*\}\]/s);
        if (arrayMatch) {
          cleanedInput = arrayMatch[0];
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
      <h1 style={{ color: '#d42121', marginBottom: '10px' }}>Newsletter Story Reorderer</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>Paste the Make aggregator output, drag stories to reorder within categories, then copy the exported JSON to paste back into Make.</p>

      {/* Input Section */}
      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Paste JSON from Make:</label>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Paste the aggregator JSON here..."
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
                            <div style={{ fontWeight: 'bold', fontSize: '15px', lineHeight: '1.4', marginBottom: '6px' }}>
                              {story.outlet}: {story.title}
                            </div>
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
                    .filter(([_, storyList]) => storyList.length > 0)
                    .map(
                      ([category, categoryStories]) => `
                    <h3 style="color: #d42121; margin-top: 20px; margin-bottom: 10px;">${category.replace(/^\d\.\s/, '')}</h3>
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
