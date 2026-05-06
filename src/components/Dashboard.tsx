import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Folder, Trash2, Settings, HelpCircle, Bell, Search, Hexagon, Upload } from 'lucide-react';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const templates = [
  { id: '1', title: 'Blog Post Template', category: 'Content' },
  { id: '2', title: 'Email Template', category: 'Email' },
  { id: '3', title: 'Project Proposal', category: 'Business' },
  { id: '4', title: 'Report Template', category: 'Business' },
  { id: '5', title: 'Meeting Notes', category: 'Productivity' },
  { id: '6', title: 'Press Release', category: 'Marketing' },
  { id: '7', title: 'Social Media Post', category: 'Marketing' },
  { id: '8', title: 'Case Study', category: 'Business' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let customHtml = '';

      if (file.name.toLowerCase().endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        customHtml = result.value;
      } else if (file.name.toLowerCase().endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += `<p>${pageText}</p>`;
        }
        customHtml = fullText;
      } else {
        alert("Unsupported file type. Please upload a .docx or .pdf file.");
        setIsUploading(false);
        return;
      }

      navigate('/template/custom', { state: { customHtml } });
    } catch (error) {
      console.error("Error parsing file:", error);
      alert("An error occurred while parsing the file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Hexagon size={22} fill="white" strokeWidth={1.5} />
          </div>
          <span className="brand-name">DocuPilot</span>
        </div>
        
        <div className="sidebar-nav">
          <a href="#" className="sidebar-link active">
            <LayoutDashboard size={20} />
            Dashboard
          </a>
          <a href="#" className="sidebar-link">
            <FileText size={20} />
            Templates
          </a>
          <a href="#" className="sidebar-link">
            <Folder size={20} />
            My Documents
          </a>
          <a href="#" className="sidebar-link">
            <Trash2 size={20} />
            Trash
          </a>
        </div>
        
        <div className="sidebar-nav" style={{ marginTop: 'auto' }}>
          <a href="#" className="sidebar-link">
            <Settings size={20} />
            Settings
          </a>
          <a href="#" className="sidebar-link">
            <HelpCircle size={20} />
            Help
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Templates</h1>
          <div className="user-profile">
            <Bell size={22} className="text-gray-400 cursor-pointer hover:text-gray-700 transition-colors" />
            <div className="flex items-center gap-3 cursor-pointer pl-4 border-l border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Malia Adams</span>
              <div className="user-avatar">
                MA
              </div>
            </div>
          </div>
        </div>

        <div className="search-bar">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search available templates..." 
            />
          </div>
          <button 
            className="btn-outline flex items-center gap-2 px-4 whitespace-nowrap"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload size={18} />
            {isUploading ? 'Parsing...' : 'Upload Document'}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".docx,.pdf" 
            style={{ display: 'none' }} 
          />
        </div>

        <div className="templates-grid">
          {templates.map(template => (
            <div 
              key={template.id} 
              className="template-card"
              onClick={() => navigate(`/template/${template.id}`)}
            >
              <div className="template-preview">
                <FileText size={56} opacity={0.5} />
              </div>
              <div className="template-info">
                <h3 className="template-title">{template.title}</h3>
                <span className="template-category">{template.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
