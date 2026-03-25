import { useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import type { FormEvent } from 'react';
import styles from './AdminPanel.module.css';
import type { ContentV2, CurationItem, Project, Writing } from '../types/content';

const MDEditor = lazy(() => import('@uiw/react-md-editor'));

const API_BASE = 'http://127.0.0.1:3001/api';
const SESSION_KEY = 'admin_pwd';
const SESSION_AT = 'admin_login_at';
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const DRAFT_KEY = 'admin_unsaved_content';

type AdminTab = 'projects' | 'writings' | 'curations' | 'footer';
type SearchType = 'Book' | 'Movie' | 'Music';

interface ApiContentResponse {
  data: ContentV2;
  schemaVersion: number;
  checksum: string;
  version: number;
}

interface SearchResult {
  source: string;
  type: SearchType;
  title: string;
  author: string;
  image: string;
  description: string;
}

const tabNames: Record<AdminTab, string> = {
  projects: '项目 Projects',
  writings: '文章 Writings',
  curations: '策展 Curations',
  footer: '页脚 Footer',
};

const createProject = (): Project => ({
  id: Date.now(),
  slug: `project-${Date.now()}`,
  title: '新项目标题',
  role: 'Role / Position',
  year: String(new Date().getFullYear()),
  image: 'https://',
  link: 'https://',
  excerpt: '',
  tags: [],
  status: 'draft',
  locale: 'bi',
});

const createWriting = (): Writing => ({
  id: Date.now(),
  slug: `writing-${Date.now()}`,
  title: '新文章标题',
  category: 'General',
  date: new Date().toISOString().slice(0, 10),
  image: 'https://',
  excerpt: '',
  content: '',
  tags: [],
  status: 'draft',
  locale: 'zh',
});

const createCuration = (): CurationItem => ({
  id: Date.now(),
  slug: `curation-${Date.now()}`,
  type: 'Book',
  title: '新策展条目',
  image: 'https://',
  description: '',
  tags: [],
  status: 'published',
  locale: 'zh',
});

const checksumOf = (value: ContentV2 | null): string => JSON.stringify(value);

const AdminPanel = () => {
  const [data, setData] = useState<ContentV2 | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('projects');
  const [activeWritingId, setActiveWritingId] = useState<number | null>(null);

  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('Book');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [writingsFilter, setWritingsFilter] = useState('');
  const [sortByDate, setSortByDate] = useState<'desc' | 'asc'>('desc');
  const [saving, setSaving] = useState(false);

  const [serverVersion, setServerVersion] = useState<number>(0);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<{ id: number; label: string } | null>(null);

  const dirtyRef = useRef(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(''), 2400);
  }, []);

  const passwordFromSession = (): string | null => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    const loginAtRaw = sessionStorage.getItem(SESSION_AT);
    if (!saved || !loginAtRaw) {
      return null;
    }
    const loginAt = Number(loginAtRaw);
    if (!Number.isFinite(loginAt) || Date.now() - loginAt > SESSION_TTL_MS) {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_AT);
      return null;
    }
    return saved;
  };

  const fetchContent = useCallback(async (pwd: string) => {
    setError('');
    try {
      const res = await fetch(`${API_BASE}/content`, {
        headers: {
          'x-admin-password': pwd,
        },
      });
      const payload = (await res.json()) as ApiContentResponse | { error: string };
      if (!res.ok) {
        throw new Error('error' in payload ? payload.error : 'Failed to fetch content');
      }
      const response = payload as ApiContentResponse;
      setData(response.data);
      setServerVersion(response.version);
      setLastSavedSnapshot(checksumOf(response.data));
      setActiveWritingId(response.data.writings[0]?.id ?? null);
      setIsAuthenticated(true);
      setLoginError('');
      setIsDirty(false);
      dirtyRef.current = false;
      sessionStorage.setItem(SESSION_KEY, pwd);
      sessionStorage.setItem(SESSION_AT, String(Date.now()));
      sessionStorage.removeItem(DRAFT_KEY);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知错误';
      if (!isAuthenticated) {
        setLoginError(msg);
      }
      setError(msg);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const pwd = passwordFromSession();
    if (pwd) {
      void fetchContent(pwd);
    }
  }, [fetchContent]);

  useEffect(() => {
    if (!data) {
      return;
    }
    const nextChecksum = checksumOf(data);
    const dirty = nextChecksum !== lastSavedSnapshot;
    setIsDirty(dirty);
    dirtyRef.current = dirty;
    if (dirty) {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    }
  }, [data, lastSavedSnapshot]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) {
        return;
      }
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  const restoreFromDraft = () => {
    const draft = sessionStorage.getItem(DRAFT_KEY);
    if (!draft) {
      showToast('没有可恢复草稿');
      return;
    }
    try {
      const parsed = JSON.parse(draft) as ContentV2;
      setData(parsed);
      showToast('已恢复草稿');
    } catch {
      showToast('草稿恢复失败');
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passwordInput.trim()) {
      setLoginError('请输入后台密码');
      return;
    }
    await fetchContent(passwordInput.trim());
  };

  const saveContent = async () => {
    if (!data) {
      return;
    }
    const pwd = passwordFromSession();
    if (!pwd) {
      setIsAuthenticated(false);
      setLoginError('会话已过期，请重新登录');
      return;
    }

    setSaving(true);
    try {
      const validateRes = await fetch(`${API_BASE}/content/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': pwd,
        },
        body: JSON.stringify({ data }),
      });
      const validatePayload = (await validateRes.json()) as { valid: boolean; errors?: string[]; error?: string };
      if (!validateRes.ok || !validatePayload.valid) {
        const reason = validatePayload.errors?.join('；') || validatePayload.error || '内容校验失败';
        throw new Error(reason);
      }

      await fetch(`${API_BASE}/content/backup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': pwd,
        },
      });

      const saveRes = await fetch(`${API_BASE}/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': pwd,
        },
        body: JSON.stringify({ data, expectedVersion: serverVersion }),
      });
      const savePayload = (await saveRes.json()) as { version?: number; checksum?: string; error?: string };
      if (!saveRes.ok) {
        throw new Error(savePayload.error || '保存失败');
      }

      setServerVersion(savePayload.version ?? serverVersion);
      setLastSavedSnapshot(checksumOf(data));
      setIsDirty(false);
      dirtyRef.current = false;
      sessionStorage.removeItem(DRAFT_KEY);
      showToast('发布成功，内容已同步');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
      showToast('保存失败，请检查错误信息');
    } finally {
      setSaving(false);
    }
  };

  const updateData = (updater: (prev: ContentV2) => ContentV2) => {
    setData((prev) => (prev ? updater(prev) : prev));
  };

  const handleAdd = () => {
    if (!data) {
      return;
    }

    if (activeTab === 'projects') {
      updateData((prev) => ({ ...prev, projects: [createProject(), ...prev.projects] }));
      return;
    }

    if (activeTab === 'writings') {
      const next = createWriting();
      updateData((prev) => ({ ...prev, writings: [next, ...prev.writings] }));
      setActiveWritingId(next.id);
      return;
    }

    if (activeTab === 'curations') {
      updateData((prev) => ({ ...prev, curations: [createCuration(), ...prev.curations] }));
      return;
    }

    updateData((prev) => ({
      ...prev,
      footer: [
        {
          id: Date.now(),
          email: 'hello@example.com',
          twitter_link: 'https://',
          github_link: 'https://',
          linkedin_link: 'https://',
          location: 'Shanghai, China',
          credibility: 'Trusted by product teams',
        },
      ],
    }));
  };

  const executeDelete = (id: number) => {

    if (activeTab === 'projects') {
      updateData((prev) => ({ ...prev, projects: prev.projects.filter((item) => item.id !== id) }));
      return;
    }

    if (activeTab === 'writings') {
      updateData((prev) => ({ ...prev, writings: prev.writings.filter((item) => item.id !== id) }));
      if (activeWritingId === id) {
        setActiveWritingId(null);
      }
      return;
    }

    if (activeTab === 'curations') {
      updateData((prev) => ({ ...prev, curations: prev.curations.filter((item) => item.id !== id) }));
      return;
    }

    updateData((prev) => ({ ...prev, footer: prev.footer.filter((item) => item.id !== id) }));
  };

  const handleDelete = (id: number, label: string) => {
    setDeleteCandidate({ id, label });
  };

  const updateProjectField = (id: number, field: keyof Project, value: string) => {
    updateData((prev) => ({
      ...prev,
      projects: prev.projects.map((item) => {
        if (item.id !== id) {
          return item;
        }
        if (field === 'tags') {
          return { ...item, tags: value.split(',').map((tag) => tag.trim()).filter(Boolean) };
        }
        if (field === 'status') {
          return { ...item, status: value as Project['status'] };
        }
        if (field === 'locale') {
          return { ...item, locale: value as Project['locale'] };
        }
        return { ...item, [field]: value };
      }),
    }));
  };

  const updateWritingField = (id: number, field: keyof Writing, value: string) => {
    updateData((prev) => ({
      ...prev,
      writings: prev.writings.map((item) => {
        if (item.id !== id) {
          return item;
        }
        if (field === 'tags') {
          return { ...item, tags: value.split(',').map((tag) => tag.trim()).filter(Boolean) };
        }
        if (field === 'status') {
          return { ...item, status: value as Writing['status'] };
        }
        if (field === 'locale') {
          return { ...item, locale: value as Writing['locale'] };
        }
        return { ...item, [field]: value };
      }),
    }));
  };

  const updateCurationField = (id: number, field: keyof CurationItem, value: string) => {
    updateData((prev) => ({
      ...prev,
      curations: prev.curations.map((item) => {
        if (item.id !== id) {
          return item;
        }
        if (field === 'tags') {
          return { ...item, tags: value.split(',').map((tag) => tag.trim()).filter(Boolean) };
        }
        if (field === 'type') {
          return { ...item, type: value as CurationItem['type'] };
        }
        if (field === 'status') {
          return { ...item, status: value as CurationItem['status'] };
        }
        if (field === 'locale') {
          return { ...item, locale: value as CurationItem['locale'] };
        }
        return { ...item, [field]: value };
      }),
    }));
  };

  const updateFooterField = (id: number, field: 'email' | 'twitter_link' | 'github_link' | 'linkedin_link' | 'location' | 'credibility', value: string) => {
    updateData((prev) => ({
      ...prev,
      footer: prev.footer.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const searchScraper = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }
    const pwd = passwordFromSession();
    if (!pwd) {
      setIsAuthenticated(false);
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`, {
        headers: { 'x-admin-password': pwd },
      });
      const payload = (await res.json()) as { results?: SearchResult[]; error?: string };
      if (!res.ok) {
        throw new Error(payload.error || '搜索失败');
      }
      setSearchResults(payload.results ?? []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : '搜索失败');
    } finally {
      setIsSearching(false);
    }
  };

  const importSearchResult = (result: SearchResult) => {
    updateData((prev) => ({
      ...prev,
      curations: [
        {
          id: Date.now(),
          slug: `curation-${Date.now()}`,
          type: result.type,
          title: result.title,
          image: result.image,
          description: result.description,
          tags: [result.source],
          status: 'published',
          locale: 'bi',
        },
        ...prev.curations,
      ],
    }));
    setShowSearchModal(false);
    showToast('条目已导入到策展草稿');
  };

  const uploadImage = async (file: File): Promise<string> => {
    const pwd = passwordFromSession();
    if (!pwd) {
      throw new Error('会话已过期，请重新登录');
    }

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsDataURL(file);
    });

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': pwd,
      },
      body: JSON.stringify({ imageBase64: base64 }),
    });

    const payload = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !payload.url) {
      throw new Error(payload.error || '上传失败');
    }

    return payload.url;
  };

  const filteredWritings = useMemo(() => {
    if (!data) {
      return [];
    }
    const keyword = writingsFilter.trim().toLowerCase();
    const list = data.writings.filter((item) => {
      if (!keyword) {
        return true;
      }
      return [item.title, item.category, item.excerpt, item.tags.join(',')]
        .join(' ')
        .toLowerCase()
        .includes(keyword);
    });

    return list.sort((a, b) => {
      if (sortByDate === 'desc') {
        return b.date.localeCompare(a.date);
      }
      return a.date.localeCompare(b.date);
    });
  }, [data, sortByDate, writingsFilter]);

  if (!isAuthenticated) {
    return (
      <div className={styles.loginScreen}>
        <div className={styles.loginBox}>
          <h2>后台认证</h2>
          <p>请输入本地管理密码（从环境变量 ADMIN_PASSWORD 读取）</p>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <input
              type="password"
              value={passwordInput}
              onChange={(event) => setPasswordInput(event.target.value)}
              placeholder="请输入管理密码"
              className={styles.pwdInput}
              autoFocus
            />
            <button type="submit" className={styles.loginBtn}>登录后台</button>
          </form>
          {loginError ? <p className={styles.loginErrorText}>{loginError}</p> : null}
          <a href="/" className={styles.backSiteLink}>返回前台首页</a>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className={styles.loading}>正在加载后台数据…</div>;
  }

  const activeWriting = data.writings.find((item) => item.id === activeWritingId) ?? null;

  return (
    <div className={styles.adminOs} data-lenis-prevent="true">
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <a href="/" className={styles.backLink}>返回展厅</a>
          <h1 className={styles.title}>后台管理系统</h1>
        </div>
        <div className={styles.headerActions}>
          {isDirty ? <span className={styles.cardId}>未保存更改</span> : <span className={styles.cardId}>已同步</span>}
          <button onClick={restoreFromDraft} className={styles.addBtn} type="button">恢复草稿</button>
          <button onClick={saveContent} className={styles.saveBtn} disabled={saving} type="button">
            {saving ? '发布中…' : '发布并保存'}
          </button>
        </div>
      </header>

      {error ? <div className={styles.errorScreen}><p>{error}</p></div> : null}

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          {(Object.keys(tabNames) as AdminTab[]).map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tabNames[tab]}
            </button>
          ))}
        </aside>

        <main className={styles.editor}>
          <div className={styles.editorHeader}>
            <h2>正在管理：{tabNames[activeTab]}</h2>
            <div className={styles.headerActions}>
              {activeTab === 'curations' ? (
                <button onClick={() => setShowSearchModal(true)} className={styles.searchScrapeBtn} type="button">
                  智能抓取素材
                </button>
              ) : null}
              <button onClick={handleAdd} className={styles.addBtn} type="button">+ 新增条目</button>
            </div>
          </div>

          {activeTab === 'projects' ? (
            <div className={styles.itemList}>
              {data.projects.map((item) => (
                <div key={item.id} className={styles.itemCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardId}>#{item.id}</span>
                    <button onClick={() => handleDelete(item.id, item.title)} className={styles.delBtn} type="button">删除</button>
                  </div>
                  <div className={styles.fieldGrid}>
                    <input className={styles.input} value={item.title} onChange={(event) => updateProjectField(item.id, 'title', event.target.value)} placeholder="标题" />
                    <input className={styles.input} value={item.slug} onChange={(event) => updateProjectField(item.id, 'slug', event.target.value)} placeholder="slug" />
                    <input className={styles.input} value={item.role} onChange={(event) => updateProjectField(item.id, 'role', event.target.value)} placeholder="角色" />
                    <input className={styles.input} value={item.year} onChange={(event) => updateProjectField(item.id, 'year', event.target.value)} placeholder="年份" />
                    <input className={styles.input} value={item.link} onChange={(event) => updateProjectField(item.id, 'link', event.target.value)} placeholder="链接" />
                    <input className={styles.input} value={item.image} onChange={(event) => updateProjectField(item.id, 'image', event.target.value)} placeholder="封面图" />
                    <input className={styles.input} value={item.excerpt} onChange={(event) => updateProjectField(item.id, 'excerpt', event.target.value)} placeholder="摘要" />
                    <input className={styles.input} value={item.tags.join(', ')} onChange={(event) => updateProjectField(item.id, 'tags', event.target.value)} placeholder="标签，逗号分隔" />
                    <select className={styles.input} value={item.status} onChange={(event) => updateProjectField(item.id, 'status', event.target.value)}>
                      <option value="published">published</option>
                      <option value="draft">draft</option>
                    </select>
                    <select className={styles.input} value={item.locale} onChange={(event) => updateProjectField(item.id, 'locale', event.target.value)}>
                      <option value="bi">bi</option>
                      <option value="zh">zh</option>
                      <option value="en">en</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'writings' ? (
            <div className={styles.splitLayout}>
              <div className={styles.splitSidebar}>
                <input
                  className={styles.input}
                  value={writingsFilter}
                  onChange={(event) => setWritingsFilter(event.target.value)}
                  placeholder="搜索标题/标签/分类"
                />
                <button className={styles.addBtn} type="button" onClick={() => setSortByDate((prev) => (prev === 'desc' ? 'asc' : 'desc'))}>
                  日期排序：{sortByDate === 'desc' ? '新到旧' : '旧到新'}
                </button>
                {filteredWritings.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.articleItem} ${activeWritingId === item.id ? styles.articleItemActive : ''}`}
                    onClick={() => setActiveWritingId(item.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        setActiveWritingId(item.id);
                      }
                    }}
                  >
                    <div className={styles.articleTitle}>{item.title}</div>
                    <div className={styles.articleMetaList}>{item.date} · {item.category}</div>
                  </div>
                ))}
              </div>

              <div className={styles.splitContent}>
                {activeWriting ? (
                  <div className={styles.articleEditor}>
                    <div className={styles.editorActionHeader}>
                      <button onClick={() => handleDelete(activeWriting.id, activeWriting.title)} className={styles.delBtn} type="button">删除文章</button>
                    </div>

                    <input className={styles.hugeTitleInput} value={activeWriting.title} onChange={(event) => updateWritingField(activeWriting.id, 'title', event.target.value)} placeholder="文章标题" />

                    <div className={styles.articleMetaInputs}>
                      <input className={styles.metaInput} value={activeWriting.date} onChange={(event) => updateWritingField(activeWriting.id, 'date', event.target.value)} placeholder="发布日期" />
                      <input className={styles.metaInput} value={activeWriting.category} onChange={(event) => updateWritingField(activeWriting.id, 'category', event.target.value)} placeholder="分类" />
                      <input className={styles.metaInput} value={activeWriting.slug} onChange={(event) => updateWritingField(activeWriting.id, 'slug', event.target.value)} placeholder="Slug" />
                    </div>

                    <input className={styles.input} value={activeWriting.image ?? ''} onChange={(event) => updateWritingField(activeWriting.id, 'image', event.target.value)} placeholder="封面图 URL" />
                    <input className={styles.input} value={activeWriting.excerpt} onChange={(event) => updateWritingField(activeWriting.id, 'excerpt', event.target.value)} placeholder="摘要" />
                    <input className={styles.input} value={activeWriting.tags.join(', ')} onChange={(event) => updateWritingField(activeWriting.id, 'tags', event.target.value)} placeholder="标签，逗号分隔" />
                    <div className={styles.articleMetaInputs}>
                      <select className={styles.metaInput} value={activeWriting.status} onChange={(event) => updateWritingField(activeWriting.id, 'status', event.target.value)}>
                        <option value="published">published</option>
                        <option value="draft">draft</option>
                      </select>
                      <select className={styles.metaInput} value={activeWriting.locale} onChange={(event) => updateWritingField(activeWriting.id, 'locale', event.target.value)}>
                        <option value="bi">bi</option>
                        <option value="zh">zh</option>
                        <option value="en">en</option>
                      </select>
                    </div>

                    <div className={styles.mdEditorWrapper} data-color-mode="light">
                      <Suspense fallback={<div className={styles.loading}>编辑器加载中…</div>}>
                        <MDEditor
                          value={activeWriting.content ?? ''}
                          onChange={(value) => updateWritingField(activeWriting.id, 'content', value ?? '')}
                          height={520}
                          preview="edit"
                          className={styles.mdEditor}
                        />
                      </Suspense>

                      <div className={styles.editorActionHeader}>
                        <label className={styles.addBtn}>
                          上传并插入图片
                          <input
                            hidden
                            type="file"
                            accept="image/*"
                            onChange={async (event) => {
                              const file = event.target.files?.[0];
                              if (!file) {
                                return;
                              }
                              try {
                                const url = await uploadImage(file);
                                const current = activeWriting.content ?? '';
                                updateWritingField(activeWriting.id, 'content', `${current}\n![image](${url})\n`);
                                showToast('图片上传成功');
                              } catch (err) {
                                showToast(err instanceof Error ? err.message : '上传失败');
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyEditorState}>请选择一篇文章开始编辑。</div>
                )}
              </div>
            </div>
          ) : null}

          {activeTab === 'curations' ? (
            <div className={styles.itemList}>
              {data.curations.map((item) => (
                <div key={item.id} className={styles.itemCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardId}>#{item.id}</span>
                    <button onClick={() => handleDelete(item.id, item.title)} className={styles.delBtn} type="button">删除</button>
                  </div>
                  <div className={styles.fieldGrid}>
                    <select className={styles.input} value={item.type} onChange={(event) => updateCurationField(item.id, 'type', event.target.value)}>
                      <option value="Book">Book</option>
                      <option value="Movie">Movie</option>
                      <option value="Music">Music</option>
                    </select>
                    <input className={styles.input} value={item.title} onChange={(event) => updateCurationField(item.id, 'title', event.target.value)} placeholder="标题" />
                    <input className={styles.input} value={item.slug} onChange={(event) => updateCurationField(item.id, 'slug', event.target.value)} placeholder="slug" />
                    <input className={styles.input} value={item.image} onChange={(event) => updateCurationField(item.id, 'image', event.target.value)} placeholder="封面图" />
                    <input className={styles.input} value={item.description} onChange={(event) => updateCurationField(item.id, 'description', event.target.value)} placeholder="描述" />
                    <input className={styles.input} value={item.tags.join(', ')} onChange={(event) => updateCurationField(item.id, 'tags', event.target.value)} placeholder="标签，逗号分隔" />
                    <select className={styles.input} value={item.status} onChange={(event) => updateCurationField(item.id, 'status', event.target.value)}>
                      <option value="published">published</option>
                      <option value="draft">draft</option>
                    </select>
                    <select className={styles.input} value={item.locale} onChange={(event) => updateCurationField(item.id, 'locale', event.target.value)}>
                      <option value="bi">bi</option>
                      <option value="zh">zh</option>
                      <option value="en">en</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'footer' ? (
            <div className={styles.itemList}>
              {data.footer.map((item) => (
                <div key={item.id} className={styles.itemCard}>
                  <div className={styles.fieldGrid}>
                    <input className={styles.input} value={item.email} onChange={(event) => updateFooterField(item.id, 'email', event.target.value)} placeholder="邮箱" />
                    <input className={styles.input} value={item.location} onChange={(event) => updateFooterField(item.id, 'location', event.target.value)} placeholder="位置" />
                    <input className={styles.input} value={item.credibility} onChange={(event) => updateFooterField(item.id, 'credibility', event.target.value)} placeholder="可信背书" />
                    <input className={styles.input} value={item.twitter_link} onChange={(event) => updateFooterField(item.id, 'twitter_link', event.target.value)} placeholder="Twitter" />
                    <input className={styles.input} value={item.github_link} onChange={(event) => updateFooterField(item.id, 'github_link', event.target.value)} placeholder="GitHub" />
                    <input className={styles.input} value={item.linkedin_link} onChange={(event) => updateFooterField(item.id, 'linkedin_link', event.target.value)} placeholder="LinkedIn" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </main>
      </div>

      {showSearchModal ? (
        <div className={styles.modalOverlay} onClick={() => setShowSearchModal(false)}>
          <div className={styles.searchModal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>素材抓取中心</h2>
              <button className={styles.closeBtn} onClick={() => setShowSearchModal(false)} type="button">×</button>
            </div>

            <form onSubmit={searchScraper} className={styles.searchForm}>
              <select value={searchType} onChange={(event) => setSearchType(event.target.value as SearchType)} className={styles.searchInput}>
                <option value="Book">Books</option>
                <option value="Movie">Movies</option>
                <option value="Music">Music</option>
              </select>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="输入关键词，如 海子 / Blade Runner"
                className={styles.searchInput}
                style={{ flex: 1 }}
              />
              <button type="submit" className={styles.searchBtn} disabled={isSearching}>
                {isSearching ? '搜索中…' : '搜索'}
              </button>
            </form>

            <div className={styles.searchResults}>
              {!searchResults.length && !isSearching ? <div className={styles.emptyState}>输入关键词后可一键导入。</div> : null}
              {searchResults.map((result, index) => {
                const displayImage = result.source === 'Douban' || result.image.includes('doubanio.com')
                  ? `${API_BASE}/proxy-image?url=${encodeURIComponent(result.image)}`
                  : result.image;
                return (
                  <div key={`${result.title}-${index}`} className={styles.resultItem}>
                    <img src={displayImage} alt={result.title} className={styles.resultImage} />
                    <div className={styles.resultMeta}>
                      <h3>{result.title}</h3>
                      <span className={styles.resultAuthor}>{result.author} · {result.source}</span>
                      <p className={styles.resultDesc}>{result.description?.slice(0, 120)}</p>
                    </div>
                    <button className={styles.importBtn} onClick={() => importSearchResult(result)} type="button">导入</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {toastMessage ? <div className={styles.toastMessage}>{toastMessage}</div> : null}
      {deleteCandidate ? (
        <div className={styles.modalOverlay} onClick={() => setDeleteCandidate(null)}>
          <div className={styles.confirmBox} onClick={(event) => event.stopPropagation()}>
            <h3>确认删除</h3>
            <p>将永久删除「{deleteCandidate.label}」。此操作不可撤销。</p>
            <div className={styles.confirmActions}>
              <button className={styles.confirmCancelBtn} type="button" onClick={() => setDeleteCandidate(null)}>取消</button>
              <button
                className={styles.confirmConfirmBtn}
                type="button"
                onClick={() => {
                  executeDelete(deleteCandidate.id);
                  setDeleteCandidate(null);
                  showToast('条目已删除');
                }}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminPanel;
