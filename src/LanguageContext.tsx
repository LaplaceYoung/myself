import React, { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'en' | 'zh';

interface Translations {
    [key: string]: {
        en: string;
        zh: string;
    };
}

export const translations: Translations = {
    // Hero Section
    'hero.role': {
        en: 'Frontend Engineer & Designer',
        zh: '前端工程师与独立设计师'
    },
    'hero.title': {
        en: 'Exploring logic & beauty through craft',
        zh: '在逻辑与美的边界上潜心雕琢'
    },
    'hero.scroll': {
        en: '↓ Scroll',
        zh: '↓ 向下探索'
    },

    // App / Global
    'nav.translate': {
        en: '中文',
        zh: 'EN'
    },
    'nav.home': {
        en: 'Home',
        zh: '首页'
    },
    'nav.projects': {
        en: 'Projects',
        zh: '作品集'
    },
    'nav.writings': {
        en: 'Writings',
        zh: '文章'
    },
    'nav.curations': {
        en: 'Curations',
        zh: '策展'
    },
    'nav.close': {
        en: 'Close',
        zh: '关闭'
    },

    // About Section
    'about.manifesto': {
        en: 'Manifesto / 01',
        zh: '设计宣言 / 01'
    },
    'about.headingL1': {
        en: 'Designing for serendipity',
        zh: '为不期而遇的惊喜而设计'
    },
    'about.headingL2': {
        en: '& coding for impact.',
        zh: '为触动人心的体验而编码'
    },
    'about.p1': {
        en: 'I believe in the beauty of structured code and the poetry of visual design.',
        zh: '我相信结构化代码的理性之美，也沉迷于视觉设计的感性诗意。'
    },
    'about.p2': {
        en: 'Bridging the gap between engineering and art, I craft digital experiences that not only perform seamlessly but resonate on an emotional level.',
        zh: '在工程与艺术之间建立桥梁，我致力于打造不仅运行流畅，更能引起情感共鸣的数字体验。'
    },
    'about.p3': {
        en: 'Currently focusing on interactions that feel physical, textures that feel real, and typography that guides the eye naturally through digital spaces.',
        zh: '目前专注于具有物理质感的交互设计、真实细腻的材质表达，以及能够在数字空间中自然引导视线的排版美学。'
    },

    // Projects Section
    'projects.title': {
        en: 'Selected Works',
        zh: '精选作品'
    },

    // Writings Section
    'writings.title': {
        en: 'Essays & Notes',
        zh: '杂文与笔记'
    },
    'writings.badge': {
        en: 'Articles',
        zh: '篇文章'
    },

    // Curations Section
    'curations.title': {
        en: 'Curations',
        zh: '私人策展'
    },
    'curations.subtitle': {
        en: 'Books, films, and sounds that shape my perspective.',
        zh: '塑造我视角的书籍、影像与声音。'
    },

    // Footer
    'footer.cta': {
        en: "Let's create something\nbeautiful together.",
        zh: "让我们共同创造\n绝妙的事物。"
    },
    'footer.socials': {
        en: 'Socials',
        zh: '社交网络'
    },
    'footer.location': {
        en: 'Location',
        zh: '坐标'
    },
    'footer.basedIn': {
        en: 'Based in Earth',
        zh: '地球'
    },
    'footer.availableWorldwide': {
        en: 'Available Worldwide',
        zh: '全球协作可用'
    },
    'footer.rights': {
        en: 'All Rights Reserved.',
        zh: '保留所有权利。'
    },
    'footer.intent': {
        en: 'Designed with Intent.',
        zh: '以意图雕刻设计。'
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('zh'); // Default to Chinese as requested

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'zh' : 'en');
    };

    const t = (key: string): string => {
        if (!translations[key]) {
            console.warn(`Translation key not found: ${key}`);
            return key;
        }
        return translations[key][language];
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
