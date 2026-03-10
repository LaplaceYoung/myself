import { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import styles from './AdminPanel.module.css';

const API_URL = 'http://127.0.0.1:3001/api/content';

const AdminPanel = () => {
    const [data, setData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'projectsData' | 'writingsData' | 'curationsData' | 'footerData'>('projectsData');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Auth state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [loginError, setLoginError] = useState('');

    // Scraper Search State
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('Book');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // Writings Detail State
    const [activeWritingId, setActiveWritingId] = useState<number | null>(null);
    const [isDraggingImage, setIsDraggingImage] = useState(false);

    // Custom UI Overrides for Native Components
    const [toastMessage, setToastMessage] = useState('');
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, message: string, onConfirm: () => void } | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    // Fetch data only after authentication
    const fetchData = async (pwd: string) => {
        try {
            console.log("[Admin OS] Attempting connection to", API_URL);
            const res = await fetch(API_URL, {
                headers: {
                    'x-admin-password': pwd
                }
            });
            if (!res.ok) {
                if (res.status === 401) throw new Error("密码错误 (Invalid Password)");
                throw new Error(`服务器响应异常: ${res.status}`);
            }
            const jsonData = await res.json();
            setData(jsonData);
            setIsAuthenticated(true);
            setLoginError('');
            // Store temporarily in session
            sessionStorage.setItem('admin_pwd', pwd);
        } catch (err: any) {
            console.error("[Admin OS] Connection failed:", err);
            const displayMsg = err.message === 'Failed to fetch'
                ? "无法连接到后台服务器。请确保在终端运行了 'npm run admin' 并且端口 3001 未被占用。"
                : err.message;
            if (!isAuthenticated) setLoginError(displayMsg);
            else setError(displayMsg);
        }
    };

    useEffect(() => {
        // Auto login if session exists
        const savedPwd = sessionStorage.getItem('admin_pwd');
        if (savedPwd) {
            fetchData(savedPwd);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData(passwordInput);
    };

    const handleSave = async () => {
        setSaving(true);
        const pwd = sessionStorage.getItem('admin_pwd') || '';
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-password': pwd
                },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                showToast("成功保存并同步到本地代码库！(Sync Successful)");
            } else {
                showToast("保存失败，可能是密码过期或服务器断开。");
            }
        } catch (e) {
            showToast("网络错误：请确保您的本地 admin 服务器正在运行。");
        }
        setSaving(false);
    };

    const handleFieldChange = (idx: number, field: string, value: string) => {
        const newData = { ...data };
        newData[activeTab][idx][field] = value;
        setData(newData);
    };

    const handleAdd = () => {
        const newData = { ...data };
        const newItem: any = { id: Date.now() };
        if (activeTab === 'projectsData') {
            newItem.title = "新项目名称"; newItem.role = "角色/职位"; newItem.year = "2026"; newItem.image = "https://..."; newItem.link = "https://...";
        } else if (activeTab === 'writingsData') {
            newItem.title = "新文章标题"; newItem.date = "日期"; newItem.category = "分类"; newItem.image = "https://..."; newItem.content = "";
        } else if (activeTab === 'footerData') {
            newItem.email = "hello@example.com"; newItem.twitter_link = "https://..."; newItem.github_link = "https://..."; newItem.linkedin_link = "https://...";
        } else {
            newItem.type = "Book"; newItem.title = "策展标题"; newItem.image = "https://..."; newItem.description = "描述...";
        }
        newData[activeTab].unshift(newItem); // Add new items to the top
        setData(newData);

        // Auto select if it's a writing
        if (activeTab === 'writingsData') {
            setActiveWritingId(newItem.id);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setSearchResults([]);
        const pwd = sessionStorage.getItem('admin_pwd') || '';
        try {
            const res = await fetch(`http://127.0.0.1:3001/api/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`, {
                headers: { 'x-admin-password': pwd }
            });
            const json = await res.json();
            if (res.ok) {
                setSearchResults(json.results || []);
            } else {
                showToast(json.error || "搜索失败");
            }
        } catch (err) {
            showToast("搜索请求发送失败。");
        }
        setIsSearching(false);
    };

    const handleImportResult = (result: any) => {
        const newData = { ...data };
        const newItem = {
            id: Date.now(),
            type: result.type,
            title: result.title,
            image: result.image,
            description: result.description,
        };
        newData['curationsData'].unshift(newItem); // Add to top
        setData(newData);
        setShowSearchModal(false);
    };

    const handleDelete = (idx: number) => {
        setConfirmDialog({
            isOpen: true,
            message: "确定要永久删除这个精美的项目吗？(Are you sure?)",
            onConfirm: () => {
                const newData = { ...data };
                const deletedId = newData[activeTab][idx].id;
                newData[activeTab].splice(idx, 1);
                setData(newData);
                if (activeTab === 'writingsData' && activeWritingId === deletedId) {
                    setActiveWritingId(null);
                }
                setConfirmDialog(null);
            }
        });
    };

    const handleImageUpload = (idx: number, field: string, file: File) => {
        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result as string;
            const pwd = sessionStorage.getItem('admin_pwd') || '';
            try {
                const res = await fetch('http://127.0.0.1:3001/api/upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-admin-password': pwd
                    },
                    body: JSON.stringify({ imageBase64: base64 })
                });
                const jsonData = await res.json();
                if (res.ok && jsonData.url) {
                    handleFieldChange(idx, field, jsonData.url);
                } else {
                    showToast("图片上传失败: " + jsonData.error);
                }
            } catch (e) {
                showToast("网络错误无法上传图片");
            }
        };
        reader.readAsDataURL(file);
    };

    const handleInlineImageUpload = (idx: number, file: File) => {
        showToast("正在上传 Markdown 内容图片...");
        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result as string;
            const pwd = sessionStorage.getItem('admin_pwd') || '';
            try {
                const res = await fetch('http://127.0.0.1:3001/api/upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-admin-password': pwd
                    },
                    body: JSON.stringify({ imageBase64: base64 })
                });
                const jsonData = await res.json();
                if (res.ok && jsonData.url) {
                    const newData = { ...data };
                    const currentContent = newData['writingsData'][idx].content || '';
                    newData['writingsData'][idx].content = currentContent + `\n![插入的图片](${jsonData.url})\n`;
                    setData(newData);
                    showToast("内容图片插入成功！");
                } else {
                    showToast("图片上传失败: " + jsonData.error);
                }
            } catch (e) {
                showToast("网络错误无法上传图片");
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent, idx: number, field: string) => {
        e.preventDefault();
        setIsDraggingImage(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(idx, field, file);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className={styles.loginScreen}>
                <div className={styles.loginBox}>
                    <h2>认证访问 (Admin OS)</h2>
                    <p>请输入本地管理后台密码 (默认: <strong>admin888</strong>)</p>
                    <form onSubmit={handleLogin} className={styles.loginForm}>
                        <input
                            type="password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="••••••••"
                            className={styles.pwdInput}
                            autoFocus
                        />
                        <button type="submit" className={styles.loginBtn}>解锁系统 (Unlock)</button>
                    </form>
                    {loginError && <p className={styles.loginErrorText}>{loginError}</p>}
                    <a href="/" className={styles.backSiteLink}>← 返回前台主页</a>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className={styles.errorScreen}>
            <h2>连接服务器被拒绝 (Connection Refused)</h2>
            <p>{error}</p>
            <p>请在终端中结束当前进程，并重新全量运行 <code>npm run admin</code> 命令。</p>
            <a href="/" className={styles.btn}>← 返回前台主页</a>
        </div>;
    }

    if (!data) return <div className={styles.loading}>正在启动管理宇宙... Booting Admin OS...</div>;

    const tabNames: Record<string, string> = {
        projectsData: '精选作品 (Projects)',
        writingsData: '杂文与笔记 (Writings)',
        curationsData: '私人策展 (Curations)',
        footerData: '页脚设置 (Footer)'
    };

    return (
        <div className={styles.adminOs} data-lenis-prevent="true">
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <a href="/" className={styles.backLink}>← 返回展厅</a>
                    <h1 className={styles.title}>后台管理系统</h1>
                </div>
                <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
                    {saving ? '正在同步网络...' : '发布并保存更改'}
                </button>
            </header>

            <div className={styles.workspace}>
                <aside className={styles.sidebar}>
                    <button
                        className={activeTab === 'projectsData' ? styles.tabActive : styles.tab}
                        onClick={() => setActiveTab('projectsData')}>
                        {tabNames.projectsData}
                    </button>
                    <button
                        className={activeTab === 'writingsData' ? styles.tabActive : styles.tab}
                        onClick={() => setActiveTab('writingsData')}>
                        {tabNames.writingsData}
                    </button>
                    <button
                        className={activeTab === 'curationsData' ? styles.tabActive : styles.tab}
                        onClick={() => setActiveTab('curationsData')}>
                        {tabNames.curationsData}
                    </button>
                    <button
                        className={activeTab === 'footerData' ? styles.tabActive : styles.tab}
                        onClick={() => setActiveTab('footerData')}>
                        {tabNames.footerData}
                    </button>
                </aside>

                <main className={styles.editor}>
                    <div className={styles.editorHeader}>
                        <h2>正在管理: {tabNames[activeTab]}</h2>
                        <div className={styles.headerActions}>
                            {activeTab === 'curationsData' && (
                                <button onClick={() => setShowSearchModal(true)} className={styles.searchScrapeBtn}>
                                    资料库智能刮削 (Scrape)
                                </button>
                            )}
                            <button onClick={handleAdd} className={styles.addBtn}>+ 手动新增区块</button>
                        </div>
                    </div>

                    {activeTab === 'writingsData' ? (
                        <div className={styles.splitLayout}>
                            <div className={styles.splitSidebar}>
                                {data.writingsData.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className={`${styles.articleItem} ${activeWritingId === item.id ? styles.articleItemActive : ''}`}
                                        onClick={() => setActiveWritingId(item.id)}
                                    >
                                        <div className={styles.articleTitle}>{item.title || '无标题文章'}</div>
                                        <div className={styles.articleMetaList}>{item.date} · {item.category}</div>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.splitContent}>
                                {activeWritingId ? (
                                    (() => {
                                        const idx = data.writingsData.findIndex((w: any) => w.id === activeWritingId);
                                        if (idx === -1) return <div>文章未找到</div>;
                                        const item = data.writingsData[idx];
                                        return (
                                            <div className={styles.articleEditor}>
                                                <div className={styles.editorActionHeader}>
                                                    <button onClick={() => handleDelete(idx)} className={styles.delBtn}>删除此文章</button>
                                                </div>
                                                <div
                                                    className={`${styles.coverUploadArea} ${isDraggingImage ? styles.dragging : ''}`}
                                                    onDragOver={(e) => { e.preventDefault(); setIsDraggingImage(true); }}
                                                    onDragLeave={(e) => { e.preventDefault(); setIsDraggingImage(false); }}
                                                    onDrop={(e) => handleDrop(e, idx, 'image')}
                                                >
                                                    <input
                                                        className={styles.coverUrlInput}
                                                        placeholder="输入封面图片 URL ...或将本地图片拖拽至此上传上传"
                                                        value={item.image || ''}
                                                        onChange={(e) => handleFieldChange(idx, 'image', e.target.value)}
                                                    />
                                                    {item.image && <img src={item.image} alt="Cover" className={styles.coverPreview} />}
                                                </div>
                                                <input
                                                    className={styles.hugeTitleInput}
                                                    value={item.title || ''}
                                                    onChange={(e) => handleFieldChange(idx, 'title', e.target.value)}
                                                    placeholder="文章大标题"
                                                />
                                                <div className={styles.articleMetaInputs}>
                                                    <input
                                                        className={styles.metaInput}
                                                        value={item.date || ''}
                                                        onChange={(e) => handleFieldChange(idx, 'date', e.target.value)}
                                                        placeholder="发布日期 (如: Oct 12, 2025)"
                                                    />
                                                    <input
                                                        className={styles.metaInput}
                                                        value={item.category || ''}
                                                        onChange={(e) => handleFieldChange(idx, 'category', e.target.value)}
                                                        placeholder="文章分类 (如: Design)"
                                                    />
                                                </div>

                                                <div
                                                    className={styles.mdEditorWrapper}
                                                    data-color-mode="light"
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        const file = e.dataTransfer.files[0];
                                                        if (file && file.type.startsWith('image/')) {
                                                            handleInlineImageUpload(idx, file);
                                                        }
                                                    }}
                                                    onPaste={(e) => {
                                                        const file = e.clipboardData.files[0];
                                                        if (file && file.type.startsWith('image/')) {
                                                            e.preventDefault();
                                                            handleInlineImageUpload(idx, file);
                                                        }
                                                    }}
                                                >
                                                    <MDEditor
                                                        value={item.content || ''}
                                                        onChange={(val) => handleFieldChange(idx, 'content', val || '')}
                                                        height={550}
                                                        preview="edit"
                                                        visibleDragbar={true}
                                                        className={styles.mdEditor}
                                                    />
                                                    <div className={styles.editorHint}>支持将本地图片直接粘贴 (Paste) 或拖拽 (Drop) 进编辑器中。自动填入文档。</div>
                                                </div>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <div className={styles.emptyEditorState}>
                                        <div>请在左侧选择一篇文章开始全屏专注编辑</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.itemList}>
                            {data[activeTab].map((item: any, idx: number) => (
                                <div key={item.id} className={styles.itemCard}>
                                    <div className={styles.cardHeader}>
                                        <span className={styles.cardId}>区块 {idx + 1}</span>
                                        <button onClick={() => handleDelete(idx)} className={styles.delBtn}>删除此区块</button>
                                    </div>
                                    <div className={styles.fieldGrid}>
                                        {Object.keys(item).filter(k => k !== 'id' && k !== 'content').map(field => (
                                            <div key={field} className={field === 'description' || field === 'image' || field === 'link' ? styles.fullField : styles.field}>
                                                <label>{field.toUpperCase()}</label>
                                                {field === 'description' ? (
                                                    <textarea
                                                        value={item[field] || ''}
                                                        onChange={(e) => handleFieldChange(idx, field, e.target.value)}
                                                        rows={3}
                                                        className={styles.input}
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={item[field] || ''}
                                                        onChange={(e) => handleFieldChange(idx, field, e.target.value)}
                                                        className={styles.input}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Global Search & Scrape Modal */}
            {showSearchModal && (
                <div className={styles.modalOverlay} onClick={() => setShowSearchModal(false)}>
                    <div className={styles.searchModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>全球文化库智能刮削 (Google / iTunes API)</h2>
                            <button className={styles.closeBtn} onClick={() => setShowSearchModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSearch} className={styles.searchForm}>
                            <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className={styles.searchInput}>
                                <option value="Book">书籍 (Books)</option>
                                <option value="Movie">电影 (Movies)</option>
                                <option value="Music">音乐专辑 (Music)</option>
                            </select>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="输入作品中英文名称..."
                                className={styles.searchInput}
                                style={{ flex: 1 }}
                                autoFocus
                            />
                            <button type="submit" className={styles.searchBtn} disabled={isSearching}>
                                {isSearching ? '检索中...' : '搜索资源'}
                            </button>
                        </form>

                        <div className={styles.searchResults}>
                            {searchResults.length === 0 && !isSearching && (
                                <div className={styles.emptyState}>输入书影音名称，自动拉取高清封面与简介。支持深度防重复。</div>
                            )}
                            {searchResults.map((res: any, idx: number) => {
                                // Use proxy for Douban or other external images to ensure stability
                                const displayImage = res.source === 'Douban' || res.image.includes('doubanio.com')
                                    ? `http://127.0.0.1:3001/api/proxy-image?url=${encodeURIComponent(res.image)}`
                                    : res.image;

                                return (
                                    <div key={idx} className={styles.resultItem}>
                                        <img src={displayImage} alt={res.title} className={styles.resultImage} />
                                        <div className={styles.resultMeta}>
                                            <h3>{res.title}</h3>
                                            <span className={styles.resultAuthor}>{res.author} · {res.source}</span>
                                            <p className={styles.resultDesc}>{res.description.slice(0, 100)}{res.description.length > 100 ? '...' : ''}</p>
                                        </div>
                                        <button className={styles.importBtn} onClick={() => handleImportResult(res)}>
                                            一键导入
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Confirm Dialog */}
            {confirmDialog && confirmDialog.isOpen && (
                <div className={styles.modalOverlay} onClick={() => setConfirmDialog(null)}>
                    <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
                        <h3>执行确认 (Confirm)</h3>
                        <p>{confirmDialog.message}</p>
                        <div className={styles.confirmActions}>
                            <button onClick={confirmDialog.onConfirm} className={styles.confirmConfirmBtn}>确认消除 (Confirm)</button>
                            <button onClick={() => setConfirmDialog(null)} className={styles.confirmCancelBtn}>取消 (Cancel)</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Toast Message */}
            {toastMessage && (
                <div className={styles.toastMessage}>
                    {toastMessage}
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
