import { useState } from 'react';
import { useSessionStore } from './store/session-store';
import ImageUploader from './components/ImageUploader';
import ImageUpload from './components/ImageUpload';
import ProgressPanel from './components/ProgressPanel';
import ResultViewer from './components/ResultViewer';
import { STLTest } from './components/STLTest';
import './App.css';

function App() {
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [showTest, setShowTest] = useState(false);
  const { isProcessing, progress, currentMessage, reset } = useSessionStore();

  const handleImageSelect = (file: File, imageUrl: string) => {
    setImageFile(file);
    setImageUrl(imageUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl) {
      alert('请选择或输入图片');
      return;
    }

    try {
      const payload: any = {
        imageUrl,
        description: description || '未提供描述',
        targetSize: { width: 100, height: 80, depth: 60 },
      };

      // 如果有本地文件，使用 FormData 上传
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('description', payload.description);
        formData.append('targetSize', JSON.stringify(payload.targetSize));

        const response = await fetch('/api/session', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        
        if (data.success) {
          console.log('Session created:', data.data.sessionId);
          useSessionStore.getState().connectSocket(data.data.sessionId);
          useSessionStore.getState().setSessionId(data.data.sessionId);
          useSessionStore.getState().setImageUrl(imageUrl);
          useSessionStore.getState().setStatus('analyzing');
        } else {
          alert('创建会话失败：' + (data.error?.message || '未知错误'));
        }
      } else {
        // 使用 JSON 方式提交 URL
        const response = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        
        if (data.success) {
          console.log('Session created:', data.data.sessionId);
          useSessionStore.getState().connectSocket(data.data.sessionId);
          useSessionStore.getState().setSessionId(data.data.sessionId);
          useSessionStore.getState().setImageUrl(imageUrl);
          useSessionStore.getState().setStatus('analyzing');
        } else {
          alert('创建会话失败：' + (data.error?.message || '未知错误'));
        }
      }
    } catch (error) {
      console.error('Submit failed:', error);
      alert('提交失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleReset = () => {
    reset();
    setImageUrl('');
    setDescription('');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🤖 NewsDiscovery</h1>
        <p className="subtitle">AI 驱动的图片到积木建模系统</p>
        <button
          onClick={() => setShowTest(!showTest)}
          style={{
            marginTop: '15px',
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid white',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          {showTest ? '🏠 返回主页' : '🧪 STL 测试'}
        </button>
      </header>

      <main className="app-main">
        {showTest ? (
          <STLTest />
        ) : (
        <section className="input-section">
          <h2>📸 上传图片</h2>
          <form onSubmit={handleSubmit} className="input-form">
            <ImageUpload 
              onImageSelect={handleImageSelect}
              disabled={isProcessing}
            />

            <div className="form-divider">
              <span>或</span>
            </div>

            <div className="form-group">
              <label htmlFor="imageUrl">图片 URL</label>
              <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={isProcessing || !!imageFile}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={isProcessing}>
                {isProcessing ? '处理中...' : '开始生成'}
              </button>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleReset}
                disabled={isProcessing}
              >
                重置
              </button>
            </div>
          </form>
        </section>

        {isProcessing && (
          <section className="progress-section">
            <ProgressPanel />
          </section>
        )}

        {useSessionStore.getState().result && (
          <section className="result-section">
            <ResultViewer />
          </section>
        )}

        <ImageUploader imageUrl={imageUrl} />
        )}
      </main>

      <footer className="app-footer">
        <p>NewsDiscovery v1.0 | Powered by AI & OpenSCAD</p>
      </footer>
    </div>
  );
}

export default App;
