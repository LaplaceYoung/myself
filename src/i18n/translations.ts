export type Language = 'en' | 'zh';

export type TranslationKey =
  | 'hero.kicker'
  | 'hero.role'
  | 'hero.titleL1'
  | 'hero.titleL2'
  | 'hero.subtitle'
  | 'hero.note'
  | 'hero.scroll'
  | 'hero.overlayLabel'
  | 'hero.overlayMeta'
  | 'hero.pillStory'
  | 'hero.pillMotion'
  | 'hero.pillCraft'
  | 'nav.home'
  | 'nav.translate'
  | 'nav.projects'
  | 'nav.writings'
  | 'nav.curations'
  | 'nav.close'
  | 'nav.progress'
  | 'about.manifesto'
  | 'about.headingL1'
  | 'about.headingL2'
  | 'about.statement'
  | 'about.p1'
  | 'about.p2'
  | 'about.p3'
  | 'projects.eyebrow'
  | 'projects.title'
  | 'projects.subtitle'
  | 'projects.cta'
  | 'writings.eyebrow'
  | 'writings.title'
  | 'writings.subtitle'
  | 'writings.badge'
  | 'writings.cta'
  | 'curations.eyebrow'
  | 'curations.title'
  | 'curations.subtitle'
  | 'footer.cta'
  | 'footer.socials'
  | 'footer.location'
  | 'footer.basedIn'
  | 'footer.availableWorldwide'
  | 'footer.rights'
  | 'footer.intent'
  | 'footer.credibility';

type TranslationMap = Record<TranslationKey, { en: string; zh: string }>;

export const translations: TranslationMap = {
  'hero.kicker': { en: 'Selected digital work / 2026', zh: '数字作品选 / 2026' },
  'hero.role': { en: 'Frontend Engineer & Product Builder', zh: '前端工程师与产品构建者' },
  'hero.titleL1': { en: 'Crafting calm', zh: '把复杂做得平静' },
  'hero.titleL2': { en: 'digital presence.', zh: '也把表达做得有力度。' },
  'hero.subtitle': { en: 'I design and ship product experiences that connect editorial sensitivity, clear interaction, and execution discipline.', zh: '我把 editorial 的审美、清晰的交互和稳定的交付能力，转成真正可用的产品体验。' },
  'hero.note': { en: 'Based in Shanghai, working with product and AI teams worldwide.', zh: '常驻上海，面向产品与 AI 团队协作。' },
  'hero.scroll': { en: 'Scroll', zh: '向下探索' },
  'hero.overlayLabel': { en: 'Selected frame', zh: '精选画面' },
  'hero.overlayMeta': { en: 'Frontend / Product / AI', zh: '前端 / 产品 / AI' },
  'hero.pillStory': { en: 'Story-first rhythm', zh: '叙事优先节奏' },
  'hero.pillMotion': { en: 'Purposeful motion', zh: '有目的的动效' },
  'hero.pillCraft': { en: 'Editorial craft', zh: '编辑化质感' },
  'nav.home': { en: 'Home', zh: '首页' },
  'nav.translate': { en: '中文', zh: 'EN' },
  'nav.projects': { en: 'Projects', zh: '作品' },
  'nav.writings': { en: 'Writings', zh: '文章' },
  'nav.curations': { en: 'Curations', zh: '策展' },
  'nav.close': { en: 'Close', zh: '关闭' },
  'nav.progress': { en: 'Progress', zh: '进度' },
  'about.manifesto': { en: 'Manifesto / 01', zh: '设计宣言 / 01' },
  'about.headingL1': { en: 'Designing for serendipity', zh: '为不期而遇的惊喜而设计' },
  'about.headingL2': { en: '& building for real impact.', zh: '并为真正的影响力而构建。' },
  'about.statement': { en: 'I work at the intersection of product structure, emotional clarity, and shippable systems.', zh: '我在产品结构、情绪表达与可交付系统之间工作。' },
  'about.p1': { en: 'I value both structured engineering and expressive visual craft.', zh: '我重视结构化工程，也重视有表达力的视觉语言。' },
  'about.p2': { en: 'My work bridges product logic and emotional resonance.', zh: '我的工作连接产品逻辑与情感共鸣。' },
  'about.p3': { en: 'I focus on interactions that feel calm, physical, and trustworthy.', zh: '我专注于平静、真实、可信的交互体验。' },
  'projects.eyebrow': { en: 'Selected projects / 02', zh: '精选项目 / 02' },
  'projects.title': { en: 'Selected Works', zh: '精选作品' },
  'projects.subtitle': { en: 'A compact index of products, systems, and experiments shaped with product intent.', zh: '围绕产品判断、系统能力与体验表达构建的作品索引。' },
  'projects.cta': { en: 'View Case', zh: '查看案例' },
  'writings.eyebrow': { en: 'Writing archive / 03', zh: '写作存档 / 03' },
  'writings.title': { en: 'Essays & Notes', zh: '杂文与笔记' },
  'writings.subtitle': { en: 'Fragments on product, interface quality, and the pace of making.', zh: '关于产品、界面质量与创作节奏的片段记录。' },
  'writings.badge': { en: 'articles', zh: '篇文章' },
  'writings.cta': { en: 'Read Essay', zh: '阅读全文' },
  'curations.eyebrow': { en: 'Personal curations / 04', zh: '私人策展 / 04' },
  'curations.title': { en: 'Curations', zh: '私人策展' },
  'curations.subtitle': { en: 'Books, films, and sounds shaping my perspective.', zh: '塑造我视角的书、影像与声音。' },
  'footer.cta': { en: 'Let us build something meaningful together.', zh: '一起做点有价值且长期有效的作品。' },
  'footer.socials': { en: 'Socials', zh: '社交网络' },
  'footer.location': { en: 'Location', zh: '所在地' },
  'footer.basedIn': { en: 'Based in Shanghai', zh: '常驻上海' },
  'footer.availableWorldwide': { en: 'Available worldwide', zh: '支持全球远程协作' },
  'footer.rights': { en: 'All rights reserved.', zh: '保留所有权利。' },
  'footer.intent': { en: 'Designed with intent.', zh: '有意识地设计。' },
  'footer.credibility': { en: 'Trusted by product and AI teams.', zh: '服务过产品与 AI 团队。' },
};
