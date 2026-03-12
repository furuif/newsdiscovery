import './ImageUploader.css';

interface ImageUploaderProps {
  imageUrl: string;
}

function ImageUploader({ imageUrl }: ImageUploaderProps) {
  if (!imageUrl) return null;

  return (
    <section className="image-preview-section">
      <h2>🖼️ 图片预览</h2>
      <div className="image-preview">
        <img 
          src={imageUrl} 
          alt="输入图片" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+图片加载失败8PC90ZXh0Pjwvc3ZnPg==';
          }}
        />
      </div>
    </section>
  );
}

export default ImageUploader;
