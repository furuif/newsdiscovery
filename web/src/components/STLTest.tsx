import { STLViewer } from './STLViewer';
import { useState } from 'react';

/**
 * STL 加载器测试组件
 * 用于独立测试 STL 文件加载功能
 */
export function STLTest() {
  const [file, setFile] = useState<File | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.stl')) {
      setError('请选择 STL 文件');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // 读取文件
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as ArrayBuffer;
      setArrayBuffer(result);
    };
    reader.onerror = () => {
      setError('文件读取失败');
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🧪 STL 加载器测试</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="file" 
          accept=".stl" 
          onChange={handleFileSelect}
          style={{ padding: '10px' }}
        />
        {file && (
          <p style={{ marginTop: '10px', color: '#666' }}>
            已选择：{file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
        {error && (
          <p style={{ marginTop: '10px', color: 'red' }}>
            ⚠️ {error}
          </p>
        )}
      </div>

      {arrayBuffer && (
        <div style={{ 
          width: '100%', 
          height: '500px', 
          border: '2px solid #667eea',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <STLViewer modelData={arrayBuffer} />
        </div>
      )}

      {!arrayBuffer && (
        <div style={{ 
          width: '100%', 
          height: '500px', 
          background: '#f5f5f5',
          border: '2px dashed #ccc',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
        }}>
          <p>请选择一个 STL 文件进行预览</p>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3>📝 测试说明</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>点击"选择文件"按钮选择 STL 文件</li>
          <li>支持二进制和 ASCII 格式的 STL 文件</li>
          <li>加载后会自动居中显示</li>
          <li>鼠标左键拖动旋转模型</li>
          <li>鼠标滚轮缩放</li>
          <li>鼠标右键拖动平移</li>
          <li>模型会自动旋转展示</li>
        </ul>
      </div>
    </div>
  );
}

export default STLTest;
