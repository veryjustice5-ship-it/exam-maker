import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  BookOpen, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  Download,
  Bookmark,
  Sparkles,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';
import { PDFGuide } from '../types';

interface PDFGuideViewerProps {
  guide: PDFGuide;
  initialPage?: number;
  highlightKeyword?: string;
  isCompact?: boolean;
  onClose?: () => void;
}

export const PDFGuideViewer: React.FC<PDFGuideViewerProps> = ({
  guide,
  initialPage = 1,
  highlightKeyword = '',
  isCompact = false,
  onClose,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [searchQuery, setSearchQuery] = useState<string>(highlightKeyword);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<'content' | 'toc' | 'bookmarks'>('content');
  const [bookmarkedPages, setBookmarkedPages] = useState<number[]>([1]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // If there's an actual uploaded PDF file (e.g. data URI or blob URL)
  const isRealPdfFile = !!guide.fileUrl;

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return guide.sections;
    const q = searchQuery.toLowerCase();
    return guide.sections.filter(s => 
      s.title.toLowerCase().includes(q) || 
      s.content.toLowerCase().includes(q) ||
      s.keyTerms?.some(t => t.toLowerCase().includes(q))
    );
  }, [guide.sections, searchQuery]);

  const toggleBookmark = (page: number) => {
    if (bookmarkedPages.includes(page)) {
      setBookmarkedPages(bookmarkedPages.filter(p => p !== page));
    } else {
      setBookmarkedPages([...bookmarkedPages, page]);
    }
  };

  const currentSection = guide.sections.find(s => s.pageNumber === currentPage) || guide.sections[0];

  return (
    <div className={`flex flex-col h-full bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      {/* Top App Bar */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200 truncate">
              <span className="truncate">{guide.title}</span>
              <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono">
                PDF
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {guide.authorOrSource} &bull; {guide.fileName}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab(activeTab === 'toc' ? 'content' : 'toc')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'toc' ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Table of Contents"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Index</span>
          </button>

          <button
            onClick={() => toggleBookmark(currentPage)}
            className={`p-1.5 rounded transition-colors ${
              bookmarkedPages.includes(currentPage)
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Bookmark Page"
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>

          <div className="hidden sm:flex items-center bg-slate-800 rounded px-1.5 py-0.5 gap-1 border border-slate-700">
            <button 
              onClick={() => setZoomLevel(z => Math.max(70, z - 15))}
              className="p-1 hover:text-white text-slate-400"
              title="Zoom out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-slate-300 w-8 text-center">{zoomLevel}%</span>
            <button 
              onClick={() => setZoomLevel(z => Math.min(160, z + 15))}
              className="p-1 hover:text-white text-slate-400"
              title="Zoom in"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded bg-rose-900/30 hover:bg-rose-800/50 text-rose-300 border border-rose-700/50"
              title="Close Guide"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sub-bar: Search & Pagination */}
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search keywords, formulas, definitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-750 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Page Pager */}
        <div className="flex items-center gap-1.5 text-slate-300">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] px-1.5">
            Page <span className="text-white font-semibold">{currentPage}</span> of {guide.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(guide.totalPages, p + 1))}
            disabled={currentPage >= guide.totalPages}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="flex-1 overflow-hidden flex">
        {/* Table of Contents Drawer if opened */}
        {activeTab === 'toc' && (
          <div className="w-72 bg-slate-950/95 border-r border-slate-800 p-3 overflow-y-auto shrink-0">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Document Contents</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">{guide.sections.length} Chapters</span>
            </div>
            <div className="space-y-1">
              {guide.sections.map(sec => (
                <button
                  key={sec.id}
                  onClick={() => {
                    setCurrentPage(sec.pageNumber);
                    setActiveTab('content');
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-start justify-between gap-2 ${
                    currentPage === sec.pageNumber 
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                      : 'hover:bg-slate-850 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="font-medium truncate">{sec.title}</div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">p. {sec.pageNumber}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Document Content Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/60 flex flex-col items-center">
          {isRealPdfFile ? (
            <div className="w-full h-full min-h-[500px]">
              <iframe
                src={`${guide.fileUrl}#page=${currentPage}`}
                className="w-full h-full rounded border border-slate-800 bg-white"
                title="Attached PDF Guide"
              />
            </div>
          ) : (
            <div 
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }} 
              className="w-full max-w-2xl bg-white text-slate-900 rounded-lg shadow-xl p-6 sm:p-8 border border-slate-200 transition-transform"
            >
              {/* PDF Document Header styling */}
              <div className="border-b-2 border-slate-900 pb-3 mb-6 flex justify-between items-end">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                    Official Reference Document &bull; Section {currentPage}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-950 font-serif">
                    {guide.title}
                  </h1>
                </div>
                <div className="text-right text-xs font-mono text-slate-600">
                  Page {currentPage} of {guide.totalPages}
                </div>
              </div>

              {/* Sections list on this page or search results */}
              {filteredSections.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium">No results found for &quot;{searchQuery}&quot;</p>
                  <p className="text-xs text-slate-400 mt-1">Try another keyword or clear search to browse full guide.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredSections
                    .filter(s => searchQuery ? true : s.pageNumber === currentPage)
                    .map(sec => (
                      <div key={sec.id} className="prose prose-slate max-w-none">
                        <div className="flex items-center justify-between pb-1 mb-2 border-b border-slate-200">
                          <h2 className="text-base sm:text-lg font-bold text-indigo-900 m-0">
                            {sec.title}
                          </h2>
                          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Reference: Page {sec.pageNumber}
                          </span>
                        </div>

                        {sec.keyTerms && sec.keyTerms.length > 0 && (
                          <div className="my-2 flex flex-wrap gap-1.5 items-center">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase">Core Terms:</span>
                            {sec.keyTerms.map(term => (
                              <span 
                                key={term}
                                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                                  searchQuery && term.toLowerCase().includes(searchQuery.toLowerCase())
                                    ? 'bg-amber-200 text-amber-900 border border-amber-300 font-bold'
                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                }`}
                              >
                                {term}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="text-sm leading-relaxed text-slate-800 whitespace-pre-line font-serif pt-1">
                          {sec.content}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* PDF Document Footer */}
              <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>ELGI Authorized Reference Study Material</span>
                <span>Ref: {guide.fileName}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Hint Banner */}
      <div className="bg-slate-950 px-4 py-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Tip: You can search or switch chapters freely while answering exam questions.</span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono">
          Ready for auto-grading
        </div>
      </div>
    </div>
  );
};
