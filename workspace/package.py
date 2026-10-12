#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
宿舍辈分图Demo打包脚本
用于创建可直接分发的ZIP包
"""

import os
import zipfile
import shutil
from datetime import datetime

class DormHierarchyPackager:
    def __init__(self):
        self.project_dir = os.path.dirname(os.path.abspath(__file__))
        self.files_to_include = [
            'index.html',
            'style.css',
            'script.js',
            'README.md',
            'demo-instructions.html'
        ]
        
    def create_zip_package(self):
        """创建ZIP压缩包"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        zip_filename = f'dormitory_hierarchy_demo_{timestamp}.zip'
        zip_path = os.path.join(self.project_dir, zip_filename)
        
        print(f"正在创建压缩包: {zip_filename}")
        print("-" * 50)
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file in self.files_to_include:
                file_path = os.path.join(self.project_dir, file)
                if os.path.exists(file_path):
                    print(f"添加: {file}")
                    zipf.write(file_path, file)
                else:
                    print(f"警告: {file} 不存在，已跳过")
        
        # 添加额外的说明文件
        readme_content = """# 宿舍辈分图Demo - 完整包

## 包含文件
1. index.html - 主程序文件
2. style.css - 样式文件
3. script.js - JavaScript逻辑文件
4. README.md - 详细使用说明
5. demo-instructions.html - 快速上手指南

## 使用方法
1. 解压本ZIP包
2. 用浏览器打开 index.html
3. 开始使用！

## 系统要求
- 现代浏览器（Chrome 80+、Firefox 75+、Edge 80+）
- 支持JavaScript
- 建议屏幕分辨率 1366x768 或更高

## 联系信息
如有问题，请参考 README.md 文件中的说明

祝使用愉快！ 🎉
"""
        
        with zipfile.ZipFile(zip_path, 'a') as zipf:
            zipf.writestr('使用说明.txt', readme_content)
        
        print("-" * 50)
        print(f"压缩包创建完成: {zip_filename}")
        print(f"大小: {os.path.getsize(zip_path) / 1024:.1f} KB")
        print(f"位置: {zip_path}")
        
        return zip_path
    
    def create_simple_package(self):
        """创建简化版（仅核心文件）"""
        simple_files = ['index.html', 'style.css', 'script.js']
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        zip_filename = f'dormitory_hierarchy_simple_{timestamp}.zip'
        zip_path = os.path.join(self.project_dir, zip_filename)
        
        print(f"正在创建简化版压缩包: {zip_filename}")
        print("-" * 50)
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file in simple_files:
                file_path = os.path.join(self.project_dir, file)
                if os.path.exists(file_path):
                    print(f"添加: {file}")
                    zipf.write(file_path, file)
                else:
                    print(f"错误: {file} 不存在！")
                    return None
        
        print("-" * 50)
        print(f"简化版压缩包创建完成: {zip_filename}")
        
        return zip_path
    
    def verify_files(self):
        """验证所有必需文件是否存在"""
        print("验证项目文件...")
        print("-" * 50)
        
        all_exist = True
        for file in self.files_to_include:
            file_path = os.path.join(self.project_dir, file)
            if os.path.exists(file_path):
                size_kb = os.path.getsize(file_path) / 1024
                print(f"✓ {file:25} {size_kb:6.1f} KB")
            else:
                print(f"✗ {file:25} 缺失")
                all_exist = False
        
        print("-" * 50)
        return all_exist
    
    def create_deployment_guide(self):
        """创建部署指南"""
        guide_content = """# 宿舍辈分图Demo部署指南

## 部署方式

### 1. 本地使用（最简单）
- 下载并解压ZIP包
- 双击 index.html 文件
- 浏览器会自动打开应用

### 2. 网站部署
#### 静态托管（推荐）
- GitHub Pages: 上传到仓库并开启GitHub Pages
- Netlify/Vercel: 拖拽上传或连接Git仓库
- 阿里云/腾讯云OSS: 上传文件并设置静态网站托管

#### 自有服务器
- 将所有文件复制到网站根目录
- 确保服务器配置正确的MIME类型
- 访问 http://你的域名/ 即可

### 3. 内网分享
- 将文件夹复制到U盘或共享目录
- 在其他电脑上打开 index.html
- 无需网络连接

## 配置说明

### 修改默认成员
编辑 script.js 文件，找到 initDefaultMembers() 函数：
```javascript
this.members = [
    { id: 1, name: '小泽', level: 0, title: '宿舍老祖宗' },
    // 修改这里的名字和称号
];
```

### 修改样式
编辑 style.css 文件：
- 修改 :root 中的颜色变量
- 调整字体大小和间距
- 自定义动画效果

### 添加新功能
编辑 script.js 文件：
- 在 DormitoryHierarchy 类中添加方法
- 修改事件监听器
- 扩展图形绘制逻辑

## 浏览器兼容性

### 完全支持
- Chrome 80+
- Firefox 75+
- Edge 80+
- Safari 13+

### 部分支持（可能需要polyfill）
- 旧版Edge
- IE 11（不支持）

## 性能优化建议

### 减少节点数量
- 建议最多20个成员
- 过多节点会影响拖拽性能

### 优化导出
- 降低导出图片的分辨率
- 使用 canvas.toBlob() 替代 toDataURL()

## 常见问题解决

### 1. 页面无法加载
- 检查是否所有文件都在同一目录
- 查看浏览器控制台错误信息
- 确保网络连接正常（首次需要加载字体）

### 2. 导出图片失败
- 检查浏览器是否支持html2canvas
- 尝试降低导出质量
- 使用最新版Chrome浏览器

### 3. 移动端显示问题
- 确保 viewport 设置正确
- 测试不同屏幕尺寸
- 调整触摸事件处理

## 更新维护

### 版本控制
建议使用Git管理项目：
```bash
git init
git add .
git commit -m "初始版本"
```

### 备份建议
- 定期导出辈分图备份
- 保存重要的关系配置
- 记录有趣的辈分设计

## 技术支持
如有问题，请：
1. 查看浏览器控制台错误
2. 参考 README.md 文档
3. 检查网络连接状态
4. 尝试清除浏览器缓存

祝部署顺利！ 🚀
"""
        
        guide_path = os.path.join(self.project_dir, 'DEPLOYMENT_GUIDE.md')
        with open(guide_path, 'w', encoding='utf-8') as f:
            f.write(guide_content)
        
        print(f"部署指南已创建: DEPLOYMENT_GUIDE.md")
        return guide_path

def main():
    packager = DormHierarchyPackager()
    
    print("宿舍辈分图Demo打包工具")
    print("=" * 50)
    
    # 验证文件
    if not packager.verify_files():
        print("\n⚠️  部分文件缺失，请先完成开发！")
        return
    
    # 显示菜单
    print("\n请选择操作：")
    print("1. 创建完整包（包含所有文件）")
    print("2. 创建简化包（仅核心文件）")
    print("3. 创建部署指南")
    print("4. 全部执行")
    print("5. 退出")
    
    choice = input("\n请输入选择 (1-5): ").strip()
    
    if choice == '1':
        packager.create_zip_package()
    elif choice == '2':
        packager.create_simple_package()
    elif choice == '3':
        packager.create_deployment_guide()
    elif choice == '4':
        packager.create_zip_package()
        packager.create_deployment_guide()
    elif choice == '5':
        print("再见！")
        return
    else:
        print("无效选择！")
    
    print("\n🎉 操作完成！")

if __name__ == "__main__":
    main()