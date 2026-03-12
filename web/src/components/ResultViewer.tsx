import { useSessionStore } from '../store/session-store';
import { STLViewer } from './STLViewer';
import './ResultViewer.css';

function ResultViewer() {
  const { result } = useSessionStore();

  if (!result) return null;

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
              <STLViewer modelPath={result.files[0].path} />
            ) : (
              <div className="placeholder-3d">
                <p>3D 模型预览</p>
                <p className="placeholder-note">需要后端提供 STL 文件</p>
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
                <button className="btn-download">
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
