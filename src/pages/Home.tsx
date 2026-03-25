import { useMemo } from 'react';
import HorizontalStage, { type HorizontalPanel } from '../components/HorizontalStage';
import { CurationsPanel, HeroPanel, ProjectsPanel, WritingsPanel } from '../components/UnseenPanels';

const Home = () => {
    const panels = useMemo<HorizontalPanel[]>(
        () => [
            {
                id: 'hero',
                effect: 'drift',
                content: <HeroPanel />,
            },
            {
                id: 'projects',
                effect: 'snap',
                content: <ProjectsPanel />,
            },
            {
                id: 'writings',
                effect: 'reveal',
                content: <WritingsPanel />,
            },
            {
                id: 'curations',
                effect: 'float',
                content: <CurationsPanel />,
            },
        ],
        [],
    );

    return (
        <main>
            <HorizontalStage panels={panels} />
        </main>
    );
};

export default Home;
