import { useSessionStore } from '../store/session-store';
import { STLViewer } from './STLViewer';
import { useState } from 'react';
import './ResultViewer.css';

function ResultViewer() {
  const { result } = useSessionStore();
  const [stlData, setStlData] = useState<ArrayBuffer | null>(null);
  const [loading, setLoading] = useState(false);

  if (!result) return null;

  const handleDownload = async (file: any) => {
    try {
      // 从 file.path 提取 fileId（最后一段路径）
      const fileId = file.path.split('/').pop()?.split('/').pop() || file.path;
      const sessionId = file.sessionId || 'session_unknown';
      
      // 调用后端下载 API
      const downloadUrl = `/api/session/${sessionId}/download/${encodeURIComponent(fileId)}?format=${file.format || 'stl'}`;
      
      // 创建临时链接触发下载
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `model_${Date.now()}.${file.format || 'stl'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      console.log('下载开始:', downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('下载失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleLoadSTL = async (file: any) => {
    try {
      setLoading(true);
      const response = await fetch(file.path);
      const arrayBuffer = await response.arrayBuffer();
      setStlData(arrayBuffer);
    } catch (error) {
      console.error('STL load failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="result-viewer">
      <h2>🎉 生成完成</h2>

      <div className="result-grid">
        <div className="result-card">
          <h3>📊 模型统计</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{result.statistics?.totalParts || 0}</span>
              <span className="stat-label">零件数量</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{result.layers?.length || 0}</span>
              <span className="stat-label">层数</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{result.statistics?.vertices || 0}</span>
              <span className="stat-label">顶点数</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{result.statistics?.faces || 0}</span>
              <span className="stat-label">面数</span>
            </div>
          </div>
        </div>

        <div className="result-card">
          <h3>📐 尺寸信息</h3>
          <div className="dimensions">
            <div className="dimension-item">
              <span className="dimension-label">宽度</span>
              <span className="dimension-value">{result.boundingBox?.width || 0} mm</span>
            </div>
            <div className="dimension-item">
              <span className="dimension-label">高度</span>
              <span className="dimension-value">{result.boundingBox?.height || 0} mm</span>
            </div>
            <div className="dimension-item">
              <span className="dimension-label">深度</span>
              <span className="dimension-value">{result.boundingBox?.depth || 0} mm</span>
            </div>
          </div>
        </div>

        <div className="result-card full-width">
          <h3>🎨 3D 预览</h3>
          <div className="stl-viewer-container">
            {result.files?.[0]?.path ? (
              <>
                <STLViewer modelData={stlData || undefined} />
                {!stlData && (
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                  }}>
                    <button 
                      onClick={() => handleLoadSTL(result.files[0])}
                      disabled={loading}
                      style={{
                        padding: '10px 20px',
                        background: 'rgba(102, 126, 234, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                      }}
                    >
                      {loading ? '加载中...' : '加载 STL 模型'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="placeholder-3d">
                <p>3D 模型预览</p>
                <p className="placeholder-note">STL 文件加载中...</p>
              </div>
            )}
          </div>
        </div>

        <div className="result-card full-width">
          <h3>📥 下载文件</h3>
          <div className="download-section">
            {result.files?.map((file: any, index: number) => (
              <div key={index} className="file-item">
                <span className="file-icon">📄</span>
                <div className="file-info">
                  <span className="file-name">{file.format.toUpperCase()} 文件</span>
                  <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
                </div>
                <button 
                  className="btn-download"
                  onClick={() => handleDownload(file)}
                >
                  下载
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultViewer;
