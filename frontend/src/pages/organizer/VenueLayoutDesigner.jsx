import { useState, useEffect, useRef } from 'react';
import { layoutAPI, eventsAPI } from '../../api';
import { useToast } from '../../components/Toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const ELEMENT_TYPES = [
  { type: 'table', label: '🪑 Table', color: '#4CAF50', w: 80, h: 80 },
  { type: 'booth', label: '🛋️ Booth', color: '#9C27B0', w: 120, h: 80 },
  { type: 'bar', label: '☕ Bar/Counter', color: '#795548', w: 200, h: 60 },
  { type: 'stage', label: '🎵 Stage', color: '#FF5722', w: 200, h: 100 },
  { type: 'entrance', label: '🚪 Entrance', color: '#2196F3', w: 100, h: 40 },
  { type: 'exit', label: '🚨 Exit', color: '#F44336', w: 80, h: 40 },
  { type: 'equipment', label: '🖥️ Equipment', color: '#607D8B', w: 100, h: 60 },
  { type: 'decoration', label: '🌿 Decoration', color: '#8BC34A', w: 60, h: 60 },
];

let idCounter = 100;

const VenueLayoutDesigner = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [setupInstructions, setSetupInstructions] = useState('');
  const [sharedWithStaff, setSharedWithStaff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drag, setDrag] = useState(null);
  const canvasRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await eventsAPI.getAll();
        setEvents(res.data);
        if (res.data.length > 0) setSelectedEvent(res.data[0]._id);
      } catch { toast('Failed to load events', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    const fetch = async () => {
      try {
        const res = await layoutAPI.get(selectedEvent);
        setElements(res.data.elements || []);
        setSetupInstructions(res.data.setupInstructions || '');
        setSharedWithStaff(res.data.sharedWithStaff || false);
      } catch { setElements([]); }
    };
    fetch();
  }, [selectedEvent]);

  const addElement = (type) => {
    const def = ELEMENT_TYPES.find(t => t.type === type);
    const newEl = { id: `el-${++idCounter}`, type, label: def.label.split(' ').slice(1).join(' '), x: 50, y: 50, width: def.w, height: def.h, rotation: 0, color: def.color, seats: type === 'table' ? 4 : 0 };
    setElements(prev => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current) setSelectedId(null);
  };

  const handleElementMouseDown = (e, elId) => {
    e.stopPropagation();
    setSelectedId(elId);
    const rect = canvasRef.current.getBoundingClientRect();
    const el = elements.find(el => el.id === elId);
    setDrag({ id: elId, startX: e.clientX - rect.left - el.x, startY: e.clientY - rect.top - el.y });
  };

  const handleMouseMove = (e) => {
    if (!drag) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const nx = Math.max(0, Math.min(800 - 40, e.clientX - rect.left - drag.startX));
    const ny = Math.max(0, Math.min(600 - 20, e.clientY - rect.top - drag.startY));
    setElements(prev => prev.map(el => el.id === drag.id ? { ...el, x: nx, y: ny } : el));
  };

  const handleMouseUp = () => setDrag(null);

  const updateSelected = (key, val) => {
    setElements(prev => prev.map(el => el.id === selectedId ? { ...el, [key]: val } : el));
  };

  const deleteSelected = () => {
    setElements(prev => prev.filter(el => el.id !== selectedId));
    setSelectedId(null);
  };

  const handleSave = async () => {
    if (!selectedEvent) { toast('Please select an event', 'error'); return; }
    setSaving(true);
    try {
      await layoutAPI.save(selectedEvent, { elements, setupInstructions, sharedWithStaff, canvasWidth: 800, canvasHeight: 600 });
      toast('Layout saved successfully!', 'success');
    } catch { toast('Failed to save layout', 'error'); }
    finally { setSaving(false); }
  };

  const handleExportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const svgEl = canvas.querySelector('svg');
    if (!svgEl) {
      // Fallback: export the div as an image using canvas API
      const rect = canvas.getBoundingClientRect();
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = 800;
      exportCanvas.height = 600;
      const ctx = exportCanvas.getContext('2d');
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 800, 600);
      elements.forEach(el => {
        ctx.fillStyle = el.color + '33';
        ctx.strokeStyle = el.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, el.width, el.height, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#1a202c';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(el.label, el.x + el.width / 2, el.y + el.height / 2);
      });
      const link = document.createElement('a');
      link.download = `layout-${selectedEvent}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
      toast('Layout exported as PNG!', 'success');
      return;
    }
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const img = new Image();
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = 800; c.height = 600;
      c.getContext('2d').drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = `layout-${selectedEvent}.png`;
      link.href = c.toDataURL('image/png');
      link.click();
      URL.revokeObjectURL(url);
      toast('Layout exported as PNG!', 'success');
    };
    img.src = url;
  };

  const selectedEl = elements.find(el => el.id === selectedId);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header">
        <h1>Venue Layout Designer</h1>
        <div className="page-actions">
          <select className="form-control" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} style={{ width: 200 }}>
            {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <input type="checkbox" checked={sharedWithStaff} onChange={e => setSharedWithStaff(e.target.checked)} />
            Share with Staff
          </label>
          <button className="btn btn-outline" onClick={handleExportImage} disabled={elements.length === 0}>🖼️ Export PNG</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : '💾 Save Layout'}</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 220px', gap: 16, alignItems: 'start' }}>
        {/* Toolbar */}
        <div>
          <div className="card card-body">
            <h4 className="mb-3">Add Elements</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ELEMENT_TYPES.map(type => (
                <button key={type.type} className="element-btn" onClick={() => addElement(type.type)}>
                  <span style={{ width: 12, height: 12, borderRadius: 2, background: type.color, display: 'inline-block' }} />
                  {type.label}
                </button>
              ))}
            </div>
            <hr className="divider" />
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Click an element type to add it to the canvas. Drag elements to reposition.</div>
          </div>
        </div>

        {/* Canvas */}
        <div>
          <div className="layout-canvas" style={{ width: '100%', height: 600, position: 'relative', background: 'repeating-linear-gradient(0deg, transparent, transparent 39px, #e2e8f0 39px, #e2e8f0 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #e2e8f0 39px, #e2e8f0 40px)' }}
            ref={canvasRef} onMouseDown={handleCanvasMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            {elements.map(el => (
              <div key={el.id}
                className={`layout-element${selectedId === el.id ? ' selected' : ''}`}
                style={{ left: el.x, top: el.y, width: el.width, height: el.height, background: el.color, transform: `rotate(${el.rotation}deg)`, fontSize: Math.min(el.width, el.height) > 60 ? 12 : 10 }}
                onMouseDown={(e) => handleElementMouseDown(e, el.id)}>
                <div style={{ textAlign: 'center', padding: 4, overflow: 'hidden' }}>
                  <div>{el.label}</div>
                  {el.seats > 0 && <div style={{ fontSize: 10 }}>{el.seats} seats</div>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            {elements.length} elements · Click canvas to deselect · Drag elements to move
          </div>
        </div>

        {/* Properties Panel */}
        <div>
          <div className="card card-body">
            <h4 className="mb-3">Properties</h4>
            {selectedEl ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Label</label>
                  <input className="form-control" value={selectedEl.label} onChange={e => updateSelected('label', e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Width</label>
                    <input type="number" className="form-control" value={selectedEl.width} min={40} max={400} onChange={e => updateSelected('width', Number(e.target.value))} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Height</label>
                    <input type="number" className="form-control" value={selectedEl.height} min={40} max={300} onChange={e => updateSelected('height', Number(e.target.value))} />
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Rotation (°)</label>
                  <input type="number" className="form-control" value={selectedEl.rotation} min={-180} max={180} onChange={e => updateSelected('rotation', Number(e.target.value))} />
                </div>
                {selectedEl.type === 'table' && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Seats</label>
                    <input type="number" className="form-control" value={selectedEl.seats} min={0} max={20} onChange={e => updateSelected('seats', Number(e.target.value))} />
                  </div>
                )}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Color</label>
                  <input type="color" className="form-control" style={{ height: 40 }} value={selectedEl.color} onChange={e => updateSelected('color', e.target.value)} />
                </div>
                <button className="btn btn-danger btn-sm" onClick={deleteSelected}>🗑️ Delete Element</button>
              </div>
            ) : (
              <p className="text-muted text-sm">Select an element to edit its properties</p>
            )}
          </div>

          <div className="card card-body mt-3">
            <h4 className="mb-3">Setup Instructions</h4>
            <textarea className="form-control" rows={6} placeholder="Setup order, important notes for staff..." value={setupInstructions} onChange={e => setSetupInstructions(e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueLayoutDesigner;
