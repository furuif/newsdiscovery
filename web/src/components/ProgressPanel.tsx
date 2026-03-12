import { useSessionStore } from '../store/session-store';
import './ProgressPanel.css';

function ProgressPanel() {
  const { progress, currentMessage, status } = useSessionStore();

  const getStatusIcon = () => {
    switch (status) {
      case 'analyzing': return '📸';
      case 'designing': return '🧱';
      case 'validating': return '✅';
      case 'generating': return '🎨';
      case 'printing': return '🖨️';
      case 'completed': return '🎉';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'analyzing': return '视觉分析中';
      case 'designing': return '积木设计';
      case 'validating': return '结构验证';
      case 'generating': return '3D 模型生成';
      case 'printing': return '打印准备';
      case 'completed': return '完成';
      case 'failed': return '失败';
      default: return '处理中';
    }
  };

  return (
    <div className="progress-panel">
      <h2>⏳ 处理进度</h2>
      
      <div className="status-indicator">
        <span className="status-icon">{getStatusIcon()}</span>
        <span className="status-text">{getStatusText()}</span>
      </div>

      <div className="progress-bar-container">
        <div 
          className="progress-bar" 
          style={{ width: `${progress}%` }}
        >
          <span className="progress-percentage">{progress}%</span>
        </div>
      </div>

      <div className="current-message">
        <p>{currentMessage}</p>
      </div>

      <div className="progress-steps">
        <div className={`step ${['analyzing', 'designing', 'validating', 'generating', 'printing', 'completed'].indexOf(status) >= 0 ? 'active' : ''}`}>
          <span className="step-icon">📸</span>
          <span className="step-label">视觉分析</span>
        </div>
        <div className={`step ${['designing', 'validating', 'generating', 'printing', 'completed'].indexOf(status) >= 0 ? 'active' : ''}`}>
          <span className="step-icon">🧱</span>
          <span className="step-label">积木设计</span>
        </div>
        <div className={`step ${['validating', 'generating', 'printing', 'completed'].indexOf(status) >= 0 ? 'active' : ''}`}>
          <span className="step-icon">✅</span>
          <span className="step-label">结构验证</span>
        </div>
        <div className={`step ${['generating', 'printing', 'completed'].indexOf(status) >= 0 ? 'active' : ''}`}>
          <span className="step-icon">🎨</span>
          <span className="step-label">3D 生成</span>
        </div>
        <div className={`step ${['printing', 'completed'].indexOf(status) >= 0 ? 'active' : ''}`}>
          <span className="step-icon">🖨️</span>
          <span className="step-label">打印</span>
        </div>
      </div>
    </div>
  );
}

export default ProgressPanel;
