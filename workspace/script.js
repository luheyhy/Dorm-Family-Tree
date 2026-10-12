// 宿舍辈分图Demo - 核心逻辑
class DormitoryHierarchy {
    constructor() {
        this.members = [];
        this.relationships = [];
        this.editingMemberId = null;
        
        // 初始化默认成员
        this.initDefaultMembers();
        this.initEventListeners();
        this.renderAll();
    }

    initDefaultMembers() {
        // 预设四个宿舍成员
        this.members = [
            { id: 1, name: '小泽', level: 0, title: '宿舍老祖宗' },
            { id: 2, name: '小浩', level: 1, title: '二当家' },
            { id: 3, name: '小玉', level: 2, title: '三当家' },
            { id: 4, name: '小李', level: 3, title: '小跟班' }
        ];

        // 预设父子关系：小泽→小浩→小王→小李
        this.relationships = [
            { id: 1, parentId: 1, childId: 2 },
            { id: 2, parentId: 2, childId: 3 },
            { id: 3, parentId: 3, childId: 4 }
        ];
    }

    initEventListeners() {
        // 添加成员按钮
        document.getElementById('addMemberBtn').addEventListener('click', () => {
            const nameInput = document.getElementById('newMemberName');
            const name = nameInput.value.trim();
            
            if (name && !this.members.find(m => m.name === name)) {
                const newId = Math.max(...this.members.map(m => m.id), 0) + 1;
                this.members.push({
                    id: newId,
                    name: name,
                    level: 0,
                    title: '新人'
                });
                nameInput.value = '';
                this.renderAll();
            } else if (name) {
                alert('这个名字已经存在了！换个更有创意的名字吧！');
            }
        });

        // 添加关系按钮
        document.getElementById('addRelationBtn').addEventListener('click', () => {
            const parentSelect = document.getElementById('parentSelect');
            const childSelect = document.getElementById('childSelect');
            const parentId = parseInt(parentSelect.value);
            const childId = parseInt(childSelect.value);

            if (!parentId || !childId) {
                alert('请选择父亲和儿子！');
                return;
            }

            if (parentId === childId) {
                alert('一个人不能当自己的爹！');
                return;
            }

            // 检查是否已经存在相同关系
            if (this.relationships.find(r => r.parentId === parentId && r.childId === childId)) {
                alert('这个父子关系已经存在了！');
                return;
            }

            // 检查是否形成循环（一个人不能当自己的祖先）
            if (this.wouldCreateCycle(parentId, childId)) {
                alert('这样会形成循环辈分关系！');
                return;
            }

            const newId = Math.max(...this.relationships.map(r => r.id), 0) + 1;
            this.relationships.push({
                id: newId,
                parentId: parentId,
                childId: childId
            });

            this.updateLevels();
            this.renderAll();
        });

        // 重置按钮
        document.getElementById('resetBtn').addEventListener('click', () => {
            if (confirm('确定要重置为初始状态吗？所有自定义修改都会丢失！')) {
                this.initDefaultMembers();
                this.renderAll();
            }
        });

        // 导出按钮
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportAsImage();
        });

        // 随机生成按钮
        document.getElementById('randomBtn').addEventListener('click', () => {
            this.generateRandomRelations();
        });

        // 模态框关闭
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('memberModal').style.display = 'none';
        });

        // 保存成员编辑
        document.getElementById('saveMemberBtn').addEventListener('click', () => {
            const nameInput = document.getElementById('editMemberName');
            const name = nameInput.value.trim();
            
            if (name && this.editingMemberId) {
                const member = this.members.find(m => m.id === this.editingMemberId);
                if (member) {
                    member.name = name;
                    this.renderAll();
                    document.getElementById('memberModal').style.display = 'none';
                }
            }
        });

        // 删除成员
        document.getElementById('deleteMemberBtn').addEventListener('click', () => {
            if (this.editingMemberId && confirm('确定要删除这个成员吗？所有相关关系也会被删除！')) {
                // 删除成员
                this.members = this.members.filter(m => m.id !== this.editingMemberId);
                // 删除相关关系
                this.relationships = this.relationships.filter(
                    r => r.parentId !== this.editingMemberId && r.childId !== this.editingMemberId
                );
                this.updateLevels();
                this.renderAll();
                document.getElementById('memberModal').style.display = 'none';
            }
        });

        // 点击外部关闭模态框
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('memberModal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    wouldCreateCycle(parentId, childId) {
        // BFS检查是否会形成循环
        const queue = [childId];
        const visited = new Set();
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            if (current === parentId) {
                return true; // 会形成循环
            }
            
            if (!visited.has(current)) {
                visited.add(current);
                // 找到当前节点的所有父亲
                const parents = this.relationships
                    .filter(r => r.childId === current)
                    .map(r => r.parentId);
                
                queue.push(...parents);
            }
        }
        
        return false;
    }

    updateLevels() {
        // 重新计算每个人的辈分等级
        const memberMap = new Map(this.members.map(m => [m.id, { ...m, level: -1 }]));
        
        // 找到所有没有父亲的人（辈分最高）
        const roots = new Set(this.members.map(m => m.id));
        this.relationships.forEach(r => {
            roots.delete(r.childId);
        });

        // BFS计算辈分
        const queue = Array.from(roots).map(id => ({ id, level: 0 }));
        
        while (queue.length > 0) {
            const { id, level } = queue.shift();
            const member = memberMap.get(id);
            
            if (member.level < level) {
                member.level = level;
                
                // 找到所有儿子
                const children = this.relationships
                    .filter(r => r.parentId === id)
                    .map(r => r.childId);
                
                children.forEach(childId => {
                    queue.push({ id: childId, level: level + 1 });
                });
            }
        }

        // 更新成员数据
        this.members = Array.from(memberMap.values());
        
        // 设置称号
        this.assignTitles();
    }

    assignTitles() {
        // 根据辈分设置搞笑称号
        const sortedMembers = [...this.members].sort((a, b) => a.level - b.level);
        
        const titles = [
            '宿舍老祖宗', '二代目', '三代目', '四代目', '五代目',
            '新秀', '小跟班', '萌新', '菜鸟', '新手',
            '潜力股', '明日之星', '宿舍希望'
        ];
        
        sortedMembers.forEach((member, index) => {
            if (index < 3) {
                // 前三名使用特殊称号
                member.title = titles[index];
            } else if (index < titles.length) {
                // 使用预设称号
                member.title = titles[index];
            } else {
                // 超出预设范围的称号
                const levelNames = ['青铜', '白银', '黄金', '钻石', '王者'];
                const levelIndex = Math.min(Math.floor(index / 3), levelNames.length - 1);
                member.title = `${levelNames[levelIndex]}级成员`;
            }
        });
    }

    renderAll() {
        this.renderMemberList();
        this.renderRelationshipList();
        this.renderRanking();
        this.renderGraph();
        this.updateSelectOptions();
    }

    renderMemberList() {
        const container = document.getElementById('memberList');
        container.innerHTML = '';
        
        this.members.forEach(member => {
            const memberElement = document.createElement('div');
            memberElement.className = 'member-item';
            memberElement.innerHTML = `
                <i class="fas fa-user"></i>
                <span>${member.name}</span>
                <span class="badge">${member.title}</span>
            `;
            
            memberElement.addEventListener('click', () => {
                this.editingMemberId = member.id;
                document.getElementById('editMemberName').value = member.name;
                document.getElementById('memberModal').style.display = 'block';
            });
            
            container.appendChild(memberElement);
        });
    }

    renderRelationshipList() {
        const container = document.getElementById('relationsList');
        container.innerHTML = '';
        
        this.relationships.forEach(relation => {
            const parent = this.members.find(m => m.id === relation.parentId);
            const child = this.members.find(m => m.id === relation.childId);
            
            if (parent && child) {
                const relationElement = document.createElement('div');
                relationElement.className = 'relation-item';
                relationElement.innerHTML = `
                    <div>
                        <strong>${parent.name}</strong> 
                        <i class="fas fa-arrow-right"></i> 
                        <strong>${child.name}</strong>
                    </div>
                    <button class="delete-relation btn btn-sm btn-danger" data-id="${relation.id}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                // 删除关系按钮
                const deleteBtn = relationElement.querySelector('.delete-relation');
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteRelation(relation.id);
                });
                
                container.appendChild(relationElement);
            }
        });
    }

    renderRanking() {
        const container = document.getElementById('rankingList');
        container.innerHTML = '';
        
        // 按辈分排序
        const sortedMembers = [...this.members].sort((a, b) => a.level - b.level);
        
        sortedMembers.forEach((member, index) => {
            const rankElement = document.createElement('div');
            rankElement.className = `rank-item rank-${index + 1}`;
            
            const funnyDescriptions = [
                '辈分最高，宿舍他说了算！',
                '仅次于老祖宗，有一定话语权',
                '中坚力量，承上启下',
                '需要努力提升地位',
                '新来的，多学习学习',
                '宿舍的希望之星',
                '潜力无限，未来可期'
            ];
            
            const description = funnyDescriptions[Math.min(index, funnyDescriptions.length - 1)];
            
            rankElement.innerHTML = `
                <div class="rank-number">${index + 1}</div>
                <div class="rank-info">
                    <div class="rank-name">${member.name}</div>
                    <div class="rank-title">${member.title} - ${description}</div>
                </div>
            `;
            
            container.appendChild(rankElement);
        });
    }

    renderGraph() {
        const container = document.getElementById('graphCanvas');
        container.innerHTML = '';
        
        // 清除之前的SVG
        d3.select('#graphCanvas svg').remove();
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        const svg = d3.select('#graphCanvas')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height]);
        
        // 添加箭头标记
        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 25)
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 8)
            .attr('markerHeight', 8)
            .append('path')
            .attr('d', 'M 0,-5 L 10,0 L 0,5')
            .attr('fill', '#666');
        
        // 创建力导向图
        const nodes = this.members.map(member => ({
            id: member.id,
            name: member.name,
            level: member.level,
            title: member.title,
            x: Math.random() * (width - 100) + 50,
            y: Math.random() * (height - 100) + 50
        }));
        
        const links = this.relationships.map(rel => ({
            source: rel.parentId,
            target: rel.childId,
            id: rel.id
        }));
        
        // 创建力模拟
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(150))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(50));
        
        // 绘制连线
        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('class', 'link')
            .attr('stroke-width', 3)
            .attr('marker-end', 'url(#arrowhead)');
        
        // 绘制节点
        const node = svg.append('g')
            .selectAll('g')
            .data(nodes)
            .enter().append('g')
            .attr('class', 'node')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));
        
        // 添加节点圆圈
        node.append('circle')
            .attr('r', 25)
            .attr('fill', d => this.getNodeColor(d.level));
        
        // 添加节点文字
        node.append('text')
            .text(d => d.name)
            .attr('font-size', 16)
            .attr('dy', 0)
            .attr('text-anchor', 'middle');
        
        // 添加辈分文字
        node.append('text')
            .text(d => `辈分: ${d.level + 1}`)
            .attr('font-size', 12)
            .attr('dy', 20)
            .attr('text-anchor', 'middle')
            .attr('fill', '#666');
        
        // 双击编辑名称
        node.on('dblclick', (event, d) => {
            this.editingMemberId = d.id;
            document.getElementById('editMemberName').value = d.name;
            document.getElementById('memberModal').style.display = 'block';
        });
        
        // 右键删除关系
        node.on('contextmenu', (event, d) => {
            event.preventDefault();
            // 找到与该节点相关的所有关系
            const relatedRelations = this.relationships.filter(
                r => r.parentId === d.id || r.childId === d.id
            );
            
            if (relatedRelations.length > 0) {
                if (confirm(`删除 ${d.name} 的所有父子关系？`)) {
                    this.relationships = this.relationships.filter(
                        r => r.parentId !== d.id && r.childId !== d.id
                    );
                    this.updateLevels();
                    this.renderAll();
                }
            }
        });
        
        // 力模拟更新
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
            
            node
                .attr('transform', d => `translate(${d.x},${d.y})`);
        });
        
        // 拖拽函数
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        
        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }
        
        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }

    getNodeColor(level) {
        const colors = [
            '#ff6b6b', // 红色 - 辈分最高
            '#4ecdc4', // 青色 - 辈分第二
            '#ffe66d', // 黄色 - 辈分第三
            '#95e1d3', // 浅青
            '#f38181', // 浅红
            '#a8e6cf', // 薄荷绿
            '#ffaaa5', // 粉红
        ];
        return colors[Math.min(level, colors.length - 1)] || colors[0];
    }

    updateSelectOptions() {
        const parentSelect = document.getElementById('parentSelect');
        const childSelect = document.getElementById('childSelect');
        
        parentSelect.innerHTML = '<option value="">选择父亲</option>';
        childSelect.innerHTML = '<option value="">选择儿子</option>';
        
        this.members.forEach(member => {
            const parentOption = document.createElement('option');
            parentOption.value = member.id;
            parentOption.textContent = `${member.name} (${member.title})`;
            parentSelect.appendChild(parentOption.cloneNode(true));
            
            const childOption = parentOption.cloneNode(true);
            childSelect.appendChild(childOption);
        });
    }

    deleteRelation(relationId) {
        this.relationships = this.relationships.filter(r => r.id !== relationId);
        this.updateLevels();
        this.renderAll();
    }

    generateRandomRelations() {
        if (this.members.length < 2) {
            alert('至少需要2个成员才能生成随机关系！');
            return;
        }
        
        if (confirm('确定要随机生成父子关系吗？当前所有关系将被清除！')) {
            this.relationships = [];
            
            // 随机生成关系，确保不会形成循环
            const maxRelations = Math.floor(this.members.length * 1.5);
            
            for (let i = 0; i < maxRelations; i++) {
                const parent = this.members[Math.floor(Math.random() * this.members.length)];
                const child = this.members[Math.floor(Math.random() * this.members.length)];
                
                if (parent.id !== child.id && 
                    !this.relationships.find(r => r.parentId === parent.id && r.childId === child.id) &&
                    !this.wouldCreateCycle(parent.id, child.id)) {
                    
                    this.relationships.push({
                        id: Math.max(...this.relationships.map(r => r.id), 0) + 1,
                        parentId: parent.id,
                        childId: child.id
                    });
                }
            }
            
            this.updateLevels();
            this.renderAll();
        }
    }

    async exportAsImage() {
        const container = document.querySelector('.graph-container');
        const preview = document.getElementById('previewContainer');
        
        try {
            // 显示加载状态
            preview.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> 正在生成辈分图...</p>';
            
            const canvas = await html2canvas(container, {
                backgroundColor: null,
                scale: 2,
                logging: false
            });
            
            const img = canvas.toDataURL('image/png');
            
            // 显示预览
            preview.innerHTML = `
                <div class="preview-content">
                    <img src="${img}" alt="辈分图预览">
                    <div class="preview-actions">
                        <a href="${img}" download="宿舍辈分图_${new Date().toLocaleDateString()}.png" 
                           class="btn btn-primary">
                            <i class="fas fa-download"></i> 下载图片
                        </a>
                        <button onclick="navigator.clipboard.writeText('${img}').then(() => alert('图片链接已复制到剪贴板！'))" 
                                class="btn btn-secondary">
                            <i class="fas fa-copy"></i> 复制链接
                        </button>
                    </div>
                </div>
            `;
            
            // 显示成功消息
            setTimeout(() => {
                alert('辈分图生成成功！点击下载按钮保存图片，或复制链接分享给室友！');
            }, 500);
            
        } catch (error) {
            console.error('导出失败:', error);
            preview.innerHTML = '<p style="color: red;">生成辈分图失败，请重试！</p>';
        }
    }

    // 获取趣味数据统计
    getFunnyStats() {
        const stats = {
            totalMembers: this.members.length,
            totalRelations: this.relationships.length,
            maxLevel: Math.max(...this.members.map(m => m.level)),
            avgChildren: this.relationships.length / this.members.length || 0
        };
        
        return stats;
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.dormHierarchy = new DormitoryHierarchy();
    
    // 添加一些趣味提示
    console.log('🎉 宿舍辈分图Demo已启动！');
    console.log('💡 试试这些操作：');
    console.log('1. 双击节点编辑成员名称');
    console.log('2. 拖拽节点调整位置');
    console.log('3. 右键节点删除所有关系');
    console.log('4. 点击"随机生成关系"创建有趣的关系网');
});

// 添加键盘快捷键
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        if (confirm('快捷键：重新随机生成关系？')) {
            window.dormHierarchy.generateRandomRelations();
        }
    }
    
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        window.dormHierarchy.exportAsImage();
    }
    
    if (e.key === 'Escape') {
        document.getElementById('memberModal').style.display = 'none';
    }
});

// 显示当前时间
function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN');
    const dateStr = now.toLocaleDateString('zh-CN');
    
    const timeElement = document.createElement('div');
    timeElement.className = 'current-time';
    timeElement.innerHTML = `<i class="fas fa-clock"></i> ${dateStr} ${timeStr}`;
    
    const header = document.querySelector('.header');
    if (!document.querySelector('.current-time')) {
        header.appendChild(timeElement);
    }
}

setInterval(updateTime, 1000);