/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 开启静态导出
  images: {
    unoptimized: true, // 必须：GitHub Pages 不支持 Next 自带图片优化
  },
  // 如果你的仓库名不是 LArielOzjH.github.io 而是别的，这里要加 basePath
  // 但既然你用主域名，这里留空即可
};

export default nextConfig;






