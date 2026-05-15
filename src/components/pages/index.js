import '../styles/Pages.css';

const createPlaceholder = (title, icon) => {
    return function PageComponent() {
        return (
            <div className="page-container">
                <div className="placeholder-content">
                    <div className="placeholder-icon">{icon}</div>
                    <h2>{title}</h2>
                    <p>Coming Soon...</p>
                    <p className="placeholder-text">This management panel is under development.</p>
                </div>
            </div>
        );
    };
};

export const UsersManagement = createPlaceholder('User Management', '👥');
export const MonstersManagement = createPlaceholder('Monsters Management', '🐲');
export const ItemsManagement = createPlaceholder('Items Management', '⚔️');
export const SkillsManagement = createPlaceholder('Skills Management', '✨');
export const RacesJobsManagement = createPlaceholder('Races & Jobs Management', '🧬');
export const QuestsManagement = createPlaceholder('Quests Management', '📜');
export const BattleHistory = createPlaceholder('Battle History', '⚡');
