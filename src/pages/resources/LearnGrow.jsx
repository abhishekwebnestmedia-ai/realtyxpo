import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const LearnGrow = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Assumption: backend exposes resource at /resources/learn-grow or /learn-grow
        const resp = await api.get('/resources/learn-grow').catch(() => api.get('/learn-grow'));
        if (!mounted) return;
        const data = resp.data?.data || resp.data || resp;
        setContent(data);
      } catch (err) {
        console.error('Failed to load Learn & Grow content', err);
        if (mounted) setError('Failed to load content');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  // Render different shapes: string HTML, array of items, or object with html/title
  if (!content) return <div className="p-4">No content available.</div>;

  if (typeof content === 'string') {
    return <div className="prose max-w-none p-4" dangerouslySetInnerHTML={{ __html: content }} />;
  }

  if (Array.isArray(content)) {
    return (
      <div className="p-4">
        <h1 className="pageheading mb-4">Learn & Grow</h1>
        <ul className="list-disc pl-6 space-y-2">
          {content.map((item, idx) => (
            <li key={item.id || item._id || idx}>
              {item.title ? <strong>{item.title}</strong> : null}
              <div className="mt-1 text-sm" dangerouslySetInnerHTML={{ __html: item.html || item.body || item.content || item.description || '' }} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // object shape
  return (
    <div className="p-4">
      <h1 className="pageheading mb-4">{content.title || 'Learn & Grow'}</h1>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.html || content.body || content.content || JSON.stringify(content) }} />
    </div>
  );
};

export default LearnGrow;