import React, { useState, useEffect, useRef } from 'react';
import { Search, Info, Sliders, RefreshCw, ZoomIn, ZoomOut, Compass } from 'lucide-react';
import { AcademicDocument } from '../types/rag.ts';

interface VectorVisualizerProps {
  documents: AcademicDocument[];
  onOpenDocumentReader: (documentId: string, pageNumber: number) => void;
}

interface VectorNode {
  id: string;
  label: string;
  documentId: string;
  source: string;
  page: number;
  x: number;
  y: number;
  topics: string[];
  sampleText: string;
}

export const VectorVisualizer: React.FC<VectorVisualizerProps> = ({
  documents,
  onOpenDocumentReader,
}) => {
  const [nodes, setNodes] = useState<VectorNode[]>([]);
  const [queryNode, setQueryNode] = useState<{ x: number; y: number; label: string } | null>(null);
  const [activeQuery, setActiveQuery] = useState('What is Machine Learning?');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [hoveredNode, setHoveredNode] = useState<VectorNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Colors for course clusters
  const clusterColors: Record<string, { fill: string; stroke: string; label: string }> = {
    doc_ai_01: { fill: '#3b82f6', stroke: '#1d4ed8', label: 'CS-401: AI & ML' },
    doc_dbms_02: { fill: '#8b5cf6', stroke: '#6d28d9', label: 'CS-303: DBMS' },
    doc_os_03: { fill: '#10b981', stroke: '#047857', label: 'CS-301: OS' },
    doc_dsa_04: { fill: '#f59e0b', stroke: '#b45309', label: 'CS-201: DSA' },
  };

  const defaultColor = { fill: '#ec4899', stroke: '#be185d', label: 'Custom Document' };

  const fetchVectorMap = async (queryText?: string) => {
    setLoading(true);
    try {
      const q = queryText !== undefined ? queryText : activeQuery;
      const res = await fetch(`/api/rag/vector-map?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setNodes(data.nodes || []);
      setQueryNode(data.queryNode || null);
    } catch (err) {
      console.error('Vector map fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVectorMap();
  }, []);

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVectorMap(activeQuery);
  };

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw coordinate grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    const cx = width / 2;
    const cy = height / 2;
    const scale = (Math.min(width, height) / 2.3) * zoom;

    // Grid circles
    for (const r of [0.25, 0.5, 0.75, 1.0]) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.35)';
      ctx.stroke();
    }

    // Axes
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
    ctx.stroke();

    // Filter nodes if needed
    const visibleNodes = nodes.filter(
      (n) => selectedCourseFilter === 'all' || n.documentId === selectedCourseFilter
    );

    // If query node exists, draw distance vectors to closest nodes
    if (queryNode) {
      const qCanvasX = cx + queryNode.x * scale;
      const qCanvasY = cy + queryNode.y * scale;

      // Find top 4 closest nodes
      const scoredNodes = visibleNodes.map((n) => {
        const dx = n.x - queryNode.x;
        const dy = n.y - queryNode.y;
        return { node: n, dist: Math.sqrt(dx * dx + dy * dy) };
      });
      scoredNodes.sort((a, b) => a.dist - b.dist);

      for (let i = 0; i < Math.min(4, scoredNodes.length); i++) {
        const item = scoredNodes[i];
        const nCanvasX = cx + item.node.x * scale;
        const nCanvasY = cy + item.node.y * scale;

        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(qCanvasX, qCanvasY);
        ctx.lineTo(nCanvasX, nCanvasY);
        ctx.strokeStyle = i === 0 ? '#10b981' : '#6366f1';
        ctx.lineWidth = i === 0 ? 2 : 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw document chunk nodes
    for (const node of visibleNodes) {
      const nx = cx + node.x * scale;
      const ny = cy + node.y * scale;
      const styling = clusterColors[node.documentId] || defaultColor;
      const isHovered = hoveredNode?.id === node.id;

      ctx.beginPath();
      ctx.arc(nx, ny, isHovered ? 8 : 5, 0, Math.PI * 2);
      ctx.fillStyle = styling.fill;
      ctx.fill();
      ctx.strokeStyle = styling.stroke;
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();

      // Subtle label
      if (isHovered || zoom > 1.2) {
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText(node.label, nx + 8, ny + 3);
      }
    }

    // Draw Query Node (if active)
    if (queryNode) {
      const qx = cx + queryNode.x * scale;
      const qy = cy + queryNode.y * scale;

      // Outer pulse halo
      ctx.beginPath();
      ctx.arc(qx, qy, 14, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
      ctx.fill();

      // Inner node
      ctx.beginPath();
      ctx.arc(qx, qy, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f1';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Query Label
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#1e1b4b';
      ctx.fillText(`Query: "${queryNode.label}"`, qx + 10, qy - 10);
    }
  }, [nodes, queryNode, zoom, selectedCourseFilter, hoveredNode]);

  // Handle Canvas Mouse Move for Hover Tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const scale = (Math.min(width, height) / 2.3) * zoom;

    let found: VectorNode | null = null;
    for (const n of nodes) {
      const nx = cx + n.x * scale;
      const ny = cy + n.y * scale;
      const dist = Math.sqrt((mouseX - nx) ** 2 + (mouseY - ny) ** 2);
      if (dist < 10) {
        found = n;
        break;
      }
    }
    setHoveredNode(found);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Visualizer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <span>High-Dimensional Vector Space</span>
            <span aria-hidden="true">·</span>
            <span>2D Semantic Projection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Semantic Embedding & Cluster Visualizer
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Explore how course concepts map to mathematical vector coordinates. Observe real-time top-k nearest neighbor retrieval for queries.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-slate-600 dark:text-slate-300">CS-401 (AI/ML)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-purple-500" />
            <span className="text-slate-600 dark:text-slate-300">CS-303 (DBMS)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300">CS-301 (OS)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-slate-600 dark:text-slate-300">CS-201 (DSA)</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Query input + Filter */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <form onSubmit={handleQuerySubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={activeQuery}
              onChange={(e) => setActiveQuery(e.target.value)}
              placeholder="Test query vector projection (e.g. Banker algorithm, ACID transactions, RAG)..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">All Course Clusters</option>
              <option value="doc_ai_01">CS-401: AI/ML</option>
              <option value="doc_dbms_02">CS-303: DBMS</option>
              <option value="doc_os_03">CS-301: OS</option>
              <option value="doc_dsa_04">CS-201: DSA</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all dark:bg-indigo-500 dark:hover:bg-indigo-600 shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Project Query</span>
            </button>
          </div>
        </form>
      </div>

      {/* Canvas Viewport and Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Canvas Visualizer Card */}
        <div className="lg:col-span-8 relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
          
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1 rounded-lg border border-slate-200 bg-white/90 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800/90">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
              className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="rounded px-2 py-0.5 text-[11px] font-mono hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              title="Reset Zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.25))}
              className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
          </div>

          <canvas
            ref={canvasRef}
            width={720}
            height={520}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredNode(null)}
            className="w-full h-auto max-w-full cursor-crosshair rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40"
          />

          <div className="mt-3 flex items-center justify-between w-full text-[11px] text-slate-400">
            <span>Hover on any node to view chunk details. Green/Indigo dashed lines indicate top-k nearest neighbors.</span>
            <span className="font-mono">L2 Cosine Metric</span>
          </div>

        </div>

        {/* Selected Node Details or Concept Card */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Chunk Preview Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {hoveredNode ? 'Inspecting Vector Node' : 'Active Query Vector'}
              </span>
              <span className="font-mono text-[11px]">
                {hoveredNode ? `Coords: (${hoveredNode.x}, ${hoveredNode.y})` : queryNode ? `(${queryNode.x}, ${queryNode.y})` : ''}
              </span>
            </div>

            {hoveredNode ? (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {hoveredNode.source} · Page {hoveredNode.page}
                  </h3>
                  <span className="font-mono text-[11px] text-slate-400">ID: {hoveredNode.id}</span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                  "{hoveredNode.sampleText}"
                </p>

                {hoveredNode.topics && hoveredNode.topics.length > 0 && (
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold">Associated Topics: </span>
                    <span>{hoveredNode.topics.join(' · ')}</span>
                  </div>
                )}

                <button
                  onClick={() => onOpenDocumentReader(hoveredNode.documentId, hoveredNode.page)}
                  className="w-full mt-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:hover:bg-indigo-900 dark:text-indigo-300 py-2 text-xs font-semibold transition-colors"
                >
                  View Full Page in Document Reader
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Submit a query to observe where it maps in semantic coordinate space. Dashed lines illustrate nearest-neighbor vectors retrieved for prompt context injection.
                </p>

                {/* Concept diagram thumbnail preview */}
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 mt-2">
                  <img
                    src="/src/assets/images/campusgpt_rag_concept_1793428540344.jpg"
                    alt="Vector space concept illustration"
                    className="w-full h-40 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent p-3 flex flex-col justify-end">
                    <span className="text-[11px] font-bold text-white">Semantic Knowledge Clusters</span>
                    <span className="text-[10px] text-slate-300">Mathematical cosine proximity correlates with conceptual relevance.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mathematical Invariants Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-xs space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-indigo-500" />
              <span>Vector Math & Retrieval Pipeline</span>
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Chunks are extracted using overlapping windows, embedded into unit-length vectors (||v||₂ = 1), and compared via fast inner products identical to cosine similarity:
            </p>
            <div className="font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded text-[11px] text-indigo-600 dark:text-indigo-400">
              sim(q, c) = q · c = cos(θ)
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Top-k chunks scoring above the strict refusal threshold are inserted into the Gemini prompt template.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
